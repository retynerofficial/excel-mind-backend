/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
const csvToJson = require("csvtojson");
const http = require("https");
const fs = require("fs");
const shortid = require("shortid");
const mongoose = require("mongoose");
const request = require("request");
const QuestionBank = require("../models/questionBank");

const { toCsv } = require("../config/converter");
const Tests = require("../models/tests");
const Class = require("../models/class");
const FinalTest = require("../models/finalTest");
const { tokengen, decodeToken } = require("../helpers/authHelper");
const tempGrade = require("../models/tempGrade");
const results = require("../models/results");

// after question has been converted to csv
// the csv is gotten and coverted to json
// eslint-disable-next-line consistent-return
exports.createTest = async (req, res) => {
  let csvFilePath = "";
  try {
    const { course } = req.params;
    console.log({ course }, "from the second part");
    let questionData;
    const getQuestions = await QuestionBank.findOne({ course });
    if (getQuestions) {
      csvFilePath = await getQuestions.location;
      console.log({ csvFilePath }, "csv location from the db");
      // const jsonArray = await csvToJson().fromFile(csvFilePath);
      console.log("i am here");
      const jsonArray = await csvToJson()
        .fromFile(csvFilePath)
        .then((json) => json, (err) => { console.error(err); });
      // console.log("jsonArray", jsonArray);

      // deletes the csv file fro the question bank if the json file didnt create
      if (!jsonArray) fs.unlinkSync(csvFilePath);
      // turns the csv file to json of questions for that course
      questionData = jsonArray.map((doc) => ({
        questionId: shortid.generate(),
        course,
        topic: doc.Topics,
        subTopics: doc.Subtopics,
        question: doc.Questions,
        options: [doc.Wrong1, doc.Wrong2, doc.Wrong3, doc.Answer],
        Image: doc.Images,
        answer: doc.Answer
      }));
    } else {
      return res.status(404).json({ response: "No question bank available for this course" });
    }
    const checkIfTestForCourse = await Tests.find({ course }).then((result, error) => {
      if (error) {
        return res.status(400).json({ response: error });
      }
      return result;
    });
    if (checkIfTestForCourse.length < 1) {
      const test = await Tests.create(questionData);
      if (test) {
        return res.status(200).json({ response: "Test question bank has been created successfully" });
      }
    } else {
      await Tests.deleteMany({ course });
      console.log("previous questions deleted");
      const test = await Tests.create(questionData);
      if (test) {
        console.log("UPDATING TEST QUESTION BANK IN PROGRESS .....");
      }
      // TODO
      // delete the excel file when opeation isnt possible
      // fs.unlinkSync(csvFilePath);
      // console.log("deleted", csvFilePath);
      return res.status(200).json({
        response: "Test question bank has been created succesfully",
        message: "Although there is an existing test for this course, but got it has been updated"
      });
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
  if (req.user.role !== "r.p") {
    return res.status(401).json({ response: "You are not authorized to perform this action" });
  }
  if (!req.params.classId) {
    return res.status(422).json({ response: "classId is required please" });
  }
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) return res.status(422).json({ response: "The question file is missing" });

    const className = await Class.findOne({ _id: req.params.classId });
    // console.log(className);
    if (!className) return res.status(404).json({ response: "This class details cant be found" });
    const { course } = className;
    console.log("from upload", course);

    if (!course) return res.status(400).json({ response: "please input the course" });
    let file = "";
    let csv;
    const download = async (url, dest, cb) => {
      file = fs.createWriteStream(dest.inputFile);
      http.get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          const inputFile = file.path;
          csv = toCsv(inputFile, dest.outputFile);
          // deletes the questionBank from the folder to prevent redundant files
          fs.unlinkSync(dest.inputFile);
          console.log("xlsl file deleted");
          file.close(cb);
        });
      });
    };

    // request({ url: fileUrl, encoding: null }, (err, resp, body) => {
    //   if (err) throw err;
    //   fs.writeFileSync(`${__dirname}/../${course}.xlsx`, body, (err) => {
    //     console.log("file written!");
    //   });
    // });
    // http.get(fileUrl).on("response", (response) => {
    //   let body = "";
    //   let i = 0;
    //   response.on("data", (chunk) => {
    //     i++;
    //     body += chunk;
    //     console.log(`BODY Part: ${i}`);
    //   });
    //   response.on("end", () => {
    //     console.log(body);
    //     fs.writeFileSync(`${__dirname}/../${course}.xlsx`, body, (err) => {
    //       if (err) {
    //         console.error(err);
    //       }
    //     });
    //     console.log("Finished");
    //   });
    // });
    const data = {
      inputFile: `${__dirname}/../${course}.xlsx`,
      outputFile: `${__dirname}/../${course}.csv`
    };

    const hello = await download(fileUrl, data);
    // console.log(hello);
    // const inputFile = `${__dirname}/../${course}.xlsx`;

    // const outputFile = `${__dirname}/../public/uploads/${course}.csv`;
    // console.log({ inputFile }, { outputFile });
    // const csv = toCsv(inputFile, hello.outputFile);
    if (csv !== "error") {
      const check = await QuestionBank.findOne({ course });
      console.log(check);
      if (!check) {
        const questionBankDetails = {
          course,
          location: data.outputFile
        };
        await QuestionBank.create(questionBankDetails).then(() => {
          console.log("question created");
        });
      } else {
        QuestionBank.findOneAndUpdate(
          { course },
          { course, location: data.outputFile }
          // { upsert: true }
        ).then((result) => {
          console.log(result, "question created");
        });
      }
    }
    // // deletes the questionBank from the folder to prevent redundant files
    // fs.unlinkSync(data.inputFile);
    // console.log("xlsl file deleted");
    res.redirect(`/api/v1/tests/${course}`);
  } catch (error) {
    return res.status(500).json({ response: `${error} occurred` });
  }
};

// pick the number of test and set it for final test creation
exports.pickTest = async (req, res) => {
  if (!req.params.classId) {
    return res.status(422).josn({ response: "class id is required in the params" });
  }
  const className = await Class.findOne({ _id: req.params.classId });
  if (!className) return res.status(404).json({ response: "This class does not exist anymore" });
  const { course } = className;

  if (!course) return res.status(400).json({ response: "please input the course" });
  try {
    const test = await Tests.find({ course });
    if (test.length < 1) return res.status(404).json({ response: "This course doenst have test to it" });
    const topicssubtopic = test.map((doc) => ({
      // topic: doc.topic,
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
  if (req.user.role !== "r.p") {
    return res.status(401).json({ response: "you are not authorized to create a test" });
  }
  // const { time } = req.body;
  // if (!time) return res.status(400).json({ response: "Test time is required" });
  try {
    if (!req.params.classId) {
      return res.status(422).josn({ response: "class id is required in the params" });
    }
    const className = await Class.findOne({ _id: req.params.classId });
    if (!className) return res.status(404).json({ response: "This class does not exist anymore" });
    if (!className || className === null) {
      return res.status(404).json({ response: "There is no record for this classId you provided" });
    }
    const { course } = className;
    console.log(course);
    const finalTest = [];
    for (const [key, value] of Object.entries(req.body)) {
      const limit = parseInt(value);
      const test = await Tests.find({ course, subTopics: `${key}` }).limit(limit);
      finalTest.push(...test);
    }

    const students = await Class.findOne({ _id: req.params.classId });
    const candidates = students.student.map((doc) => ({ studentId: doc.UserId, status: false }));

    if (finalTest.length < 1) {
      return res.status(444).json({ response: "Test has no questions, therefore wasnt created" });
    }
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

// student gets all the test he is enrolled for and hasnt taken
exports.gefinalTest = async (req, res) => {
  try {
    const studentId = req.user._id;
    const allTest = await FinalTest.find({
      closed: false,
      candidates: { $all: [{ $elemMatch: { studentId, status: false } }] }
    });
    if (!allTest) return res.status(200).json({ response: "You do not have any pending test at the moment" });
    return res.status(200).json({ allTest });
  } catch (error) {
    return res.status(500).json({ response: error });
  }
};

// The test prep scren where student see the little detatils
// about the test about to be taken
exports.testPrepScreen = async (req, res) => {
  try {
    const { classId } = req.params;
    if (!classId) {
      return res.status(422).json({ response: "Class id is missing" });
    }
    const checkClass = Class.findById(classId);
    if (!checkClass) {
      return res.status(404).json({ response: "This class doesnt exist" });
    }
    const studentId = req.user._id;
    // console.log(studentId);
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
        testLink: `https://${process.env.BASE_URL}/api/v1/tests/payload/${getTestDetails.classId}`,
        time: getTestDetails.timer,
        QuestionNum: getTestDetails.testDetails.length
      }
    });
  } catch (error) {
    return res.status(500).json({ response: error });
  }
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
    // contains userid, testid
    await tempGrade.create(
      { testId: new mongoose.Types.ObjectId(testId), userId: studentId }
    );
    await FinalTest.findOneAndUpdate(
      { _id: testId, "candidates.studentId": studentId },
      { "candidates.$.status": false }
    );
    getTestDetails.testDetails.answer = false;
    // check the amount of test question
    return res.status(200).json({
      response: "Test details successfully fetched",
      data: {
        testId,
        course: getTestDetails.course,
        time: getTestDetails.timer,
        QuestionNum: getTestDetails.testDetails.length,
        questions: shuffleArray(getTestDetails.testDetails).map((doc) => ({
          options: shuffleArray(doc.options), question: doc.question, questionId: doc.questionId
        })),
        submitLink: `https://${process.env.BASE_URL}/api/v1/tests/submitTest/${testId}/${studentId}`

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
    if (userChoice.length === 0 || !userChoice || userChoice === undefined) {
      // update grade to unsolved
      // IF ANSWER IS null AND IT IS BEEN ANSWERED B4, UPDATE IT
      returned = await tempGrade.findOneAndUpdate(
        { testId, userId, "gradeDetails.questionId": questionId },
        { "gradeDetails.$.grade": "unsolved" }
      );
      // IF ANSWER IS null BUT IT HASNT BEEN ANSWERED B4 SAVE IT
      if (returned === null) {
        await tempGrade.updateOne(
          { testId, userId },
          { $addToSet: { gradeDetails: { questionId, grade: "unsolved" } } }
        );
      }
    } else if (userChoice === answer) {
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

// submit a preview
exports.submitPreview = async (req, res) => {
  try {
    const { testId, userId } = req.params;

    const getGrade = await tempGrade.findOne({ testId, userId });
    const numberOfunSolved = getGrade.gradeDetails.filter((doc) => doc.grade === "unsolved");

    return res.status(200).json({
      response: "Test Submitted succesfully",
      data: {
        unsolved: numberOfunSolved.length,
        solved: getGrade.gradeDetails.length - numberOfunSolved.length,
        total: getGrade.gradeDetails.length,
        finishLink: `https://${process.env.BASE_URL}/api/v1/tests/submitTest/${testId}/${userId}`

      }
    });
  } catch (error) {
    return res.status(500).json({ response: error });
  }
};

// submit and saved result
exports.submitTest = async (req, res) => {
  try {
    const { testId, userId } = req.params;
    if (!testId || !userId) {
      return res.status(422).json({ response: "PLease the testid and the userid is required" });
    }

    const checkTest = await FinalTest.findById(testId);
    if (!checkTest) return res.status(404).json({ response: "Test not found" });
    const corrects = await tempGrade.findOne({ testId, userId });
    const unsolved = corrects.gradeDetails.filter((doc) => doc.grade === "unsolved");
    const correct = corrects.gradeDetails.filter((doc) => doc.grade === true);
    const wrong = corrects.gradeDetails.filter((doc) => doc.grade === false);

    const result = {
      unsolved: unsolved.length,
      correct: correct.length,
      wrong: wrong.length,
      percent: (correct.length / corrects.gradeDetails.length) * 100,
      testId,
      userId
    };

    const checkSubmitted = await results.findOne({ testId, userId }).then((result, err) => {
      if (result) {
        return res.status(200).json({ response: "You have taken and submitted this test" });
      }
      if (err) {
        return res.status(400).json({ response: err });
      }
    });
    const save = await results.create(result);
    if (save) {
      await FinalTest.updateOne(
        { _id: testId, "candidates.studentId": new mongoose.Types.ObjectId(userId) },
        { $set: { "candidates.$.status": true } }
      );
    }

    return res.status(200).json({
      response: "Test Submitted succesfully",
      data: {
        // studentName: checkSubmitted.userId,
        empty: save.unsolved,
        correct: save.correct,
        wrongs: save.wrong,
        percent: `${save.percent}%`
      }
    });
  } catch (error) {
    return res.status(500).json({ response: error });
  }
};
