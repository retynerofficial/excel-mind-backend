/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
const csvToJson = require("csvtojson");
const fs = require("fs");
const shortid = require("shortid");
const mongoose = require("mongoose");
const QuestionBank = require("../models/questionBank");

const { toCsv } = require("../config/converter");
const Tests = require("../models/tests");
const Class = require("../models/class");
const FinalTest = require("../models/finalTest");
const { tokengen, decodeToken } = require("../helpers/authHelper");
const tempGrade = require("../models/tempGrade");

// after question has been converted to csv
// the csv is gotten and coverted to json
// eslint-disable-next-line consistent-return
exports.createTest = async (req, res) => {
  let csvFilePath = "";
  try {
    const { course } = req.params;
    let questionData;
    const getQuestions = await QuestionBank.findOne({ course });
    if (getQuestions) {
      csvFilePath = getQuestions.location;
      console.log(csvFilePath);
      const jsonArray = await csvToJson().fromFile(csvFilePath);
      console.log("i am here");
      // const jsonArray = csvToJson()
      //   .fromFile(csvFilePath)
      //   .then((json) => json, (err) => { console.log(err); });
      console.log("jsonArray", jsonArray);
      if (!jsonArray) fs.unlinkSync(csvFilePath);
      questionData = jsonArray.map((doc) => ({
        questionId: shortid.generate(),
        course,
        topic: doc.Topics,
        subTopics: doc.Subtopics,
        question: doc.Questions,
        options: [doc.Wrong1, doc.Wrong2, doc.Wrong3, doc.Answer],
        answer: doc.Answer
      }));
    } else {
      return res.status(404).json({ response: "No question bank available for this course" });
    }
    const test = await Tests.create(questionData);
    if (test) {
      return res.status(200).json({ response: "Test question bank has been created successfully", questionData });
    }
  } catch (error) {
    if (error._message !== undefined && error._message === "test validation failed") {
      fs.unlinkSync(csvFilePath);
    }
    return res.status(500).json({ response: "An error occured, the operation was not succesful please try again", error });
  }
};

// question bank upoading is done
// eslint-disable-next-line consistent-return
exports.questionBank = async (req, res) => {
  try {
    const className = await Class.findOne({ _id: req.params.classId });
    const course = className.className;
    if (!req.file) return res.status(400).json({ response: "The file is missing" });
    if (!course) return res.status(400).json({ response: "please input the course" });
    const inputFile = `./${req.file.path}`;
    // const outputFile = `./public/uploads/${req.file.filename}.csv`;
    const outputFile = `${__dirname}/../public/uploads/${req.file.filename}.csv`;

    const csv = toCsv(inputFile, outputFile);
    if (csv !== "error") {
      const questionBankDetails = {
        course,
        location: outputFile
      };
      QuestionBank.create(questionBankDetails).then(() => {
      });
    }
    // deletes the questionBank from the folder to prevent redundant files
    fs.unlinkSync(inputFile);
    // console.log("xlsl file deleted");
    res.redirect(`/api/v1/test/${course}`);
  } catch (error) {
    return res.status(500).json({ response: `${error} occurred` });
  }
};

// pick the number of test and set it for final test creation
exports.pickTest = async (req, res) => {
  const { course } = req.body;
  if (!course) return res.status(400).json({ response: "please input the course" });
  try {
    const test = await Tests.find({ course });
    if (test.length < 1) return res.status(404).json({ response: "This course doenst have test to it" });
    const topicssubtopic = test.map((doc) => ({
      topic: doc.topic,
      subTopic: doc.subTopics
    }));

    const uniqueArray = topicssubtopic.filter((thing, index) => {
      const _thing = JSON.stringify(thing);
      return index === topicssubtopic.findIndex((obj) => JSON.stringify(obj) === _thing);
    });
    // console.log(uniqueArray);
    return res.status(200).json({
      response:
        uniqueArray,
      course

    });
  } catch (error) {
    return res.status(500).json({ response: "An error occured", error });
  }
};

// creating the final test that will be shown to the user
exports.chooseTest = async (req, res) => {
  // const { time } = req.body;
  // if (!time) return res.status(400).json({ response: "Test time is required" });
  try {
    const className = await Class.findOne({ _id: req.params.classId });
    const course = className.className;
    // console.log(className)
    const finalTest = [];
    for (const [key, value] of Object.entries(req.body)) {
      const limit = parseInt(value);
      const test = await Tests.find({ course, subTopics: `${key}` }).limit(limit);
      finalTest.push(...test);
    }

    const students = await Class.findOne({ _id: req.params.classId });
    const candidates = students.student.map((doc) => ({ studentId: doc.UserId, status: false }));
    // const newTest = finalTest.map((doc) => ({
    //   options: doc.options,
    //   questionId: doc._id,
    //   course: doc.course,
    //   topic: doc.topic,
    //   subTopic: doc.subTopics,
    //   question: doc.question,
    //   answer: doc.answer
    // }));
    // console.log("final", newTest);

    const testDetails = {
      course,
      candidates,
      // timer: time,
      classId: req.params.classId,
      testDetails: finalTest
    };
    const result = await FinalTest.create(testDetails);
    if (result) {
      return res.status(200).json({ response: "Test has been successfully created" });
    }
    return res.status(400).json({ response: "operation not successfull" });
  } catch (error) {
    return res.status(500).json({ response: "An error occured", error });
  }
};

// TODO
// update the time for a test
// Get the test for a course

exports.gefinalTest = async (req, res) => {
  const allTest = await FinalTest.find();
  return res.status(200).json({ allTest });
};

exports.testPrepScreen = async (req, res) => {
  const { classId } = req.params;
  const studentId = req.user._id;
  console.log(studentId);
  const getTestDetails = await FinalTest.findOne({
    classId, candidates: { $in: [{ studentId, status: false }] }
  });
  console.log(getTestDetails);

  // check if a student is eligible for that test
  if (getTestDetails === null) return res.status(401).json({ response: "you are not authorized to take this test" });

  // check the amount of test question
  // console.log(getTestDetails);
  return res.status(200).json({
    response: "Test details successfully fetched",
    data: {
      course: getTestDetails.course,
      testLink: `localhost:3000/api/v1/tests/payload/${getTestDetails.classId}`,
      time: getTestDetails.timer,
      QuestionNum: getTestDetails.testDetails.length
    }
  });
};
// function to shuffle any array
const shuffleArray = (array) => {
  const unshuffled = array;
  const shuffled = unshuffled
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
  return shuffled;
};

// GET FULL QUESTIONS
exports.fullTest = async (req, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.user._id;
    if (!req.user) return res.status(400).json({ response: "Un-Authorized user" });

    const getTestDetails = await FinalTest.findOne({
      classId, candidates: { $in: [{ studentId, status: false }] }
    });

    // check if a student is eligible for that test
    if (getTestDetails === null) return res.status(401).json({ response: "you are not authorized to take this test" });

    const testId = getTestDetails._id;
    // generate a test token that will expiry in the time of the test time
    const testToken = tokengen({ studentId, testId }, getTestDetails.timer);
    const decodeTestToken = decodeToken(testToken);
    console.log(decodeTestToken.exp);
    // contains userid, testid
    console.log(testToken);
    await tempGrade.create(
      { testId: new mongoose.Types.ObjectId(testId), userId: studentId }
    );
    await FinalTest.findOneAndUpdate(
      { _id: testId, "candidates.studentId": studentId },
      { "candidates.$.status": "in-view" }
    );
    getTestDetails.testDetails.answer = false;
    // check the amount of test question
    // console.log(getTestDetails);
    return res.status(200).json({
      response: "Test details successfully fetched",
      data: {
        course: getTestDetails.course,
        time: getTestDetails.timer,
        QuestionNum: getTestDetails.testDetails.length,
        questions: shuffleArray(getTestDetails.testDetails).map((doc) => ({
          options: shuffleArray(doc.options), question: doc.question, questionId: doc.questionId
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// submit a test question back to the backend and score
exports.submitQuestion = async (req, res) => {
  try {
    const { testId, questionId } = req.params;
    const userChoice = req.body.pick;
    const userId = req.user._id;
    // console.log(userId);
    // TRYING TO GET THE QUESTION TO FETCH THE ANSWER
    const fetchTest = await FinalTest.findOne({ _id: testId },
      { testDetails: { $elemMatch: { questionId } } });
    // console.log(fetchTest);
    // GET THE ANSWER
    const { answer } = fetchTest.testDetails[0];
    let returned;

    // CHECKS THE USER ANSWER WITH ANSWER
    if (userChoice === answer) {
    // update the score by 1
    // IF ANSWER IS CORRECT AND IT IS BEEN ANSWERED B4, UPDATE IT
      returned = await tempGrade.findOneAndUpdate(
        { testId, userId, "gradeDetails.questionId": questionId },
        { "gradeDetails.$.grade": true }
      );
      // IF ANSWER IS CORRECT BUT IT HASNT BEEN ANSWERED B4 SAVE IT
      if (returned === null) {
        await tempGrade.updateOne(
          { testId, userId },
          { $addToSet: { gradeDetails: { questionId, grade: true } } }
        );
      }
    } else {
    // update the score by 0
    // IF ANSWER IS WRONG AND IT IS BEEN ANSWERED B4, UPDATE IT
      returned = await tempGrade.findOneAndUpdate(
        { testId, userId, "gradeDetails.questionId": questionId },
        { "gradeDetails.$.grade": false }
      );
      // IF ANSWER IS WRONG BUT IT HASNT BEEN ANSWERED B4 SAVE IT
      if (returned === null) {
        await tempGrade.updateOne(
          { testId, userId },
          { $addToSet: { gradeDetails: { questionId, grade: false } } }
        );
      }
    }
    return res.status(200).json({ response: "question submitted" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
