/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
const csvToJson = require("csvtojson");
const fs = require("fs");
const QuestionBank = require("../models/questionBank");

const { toCsv } = require("../config/converter");
const Tests = require("../models/tests");
const Class = require("../models/class");

// eslint-disable-next-line consistent-return
exports.createTest = async (req, res) => {
  let csvFilePath = "";
  try {
    const { course } = req.params;
    let questionData;
    const getQuestions = await QuestionBank.findOne({ course });
    if (getQuestions) {
      csvFilePath = getQuestions.location;
      const jsonArray = await csvToJson().fromFile(csvFilePath);
      // console.log("jsonArray", jsonArray);
      questionData = jsonArray.map((doc) => ({
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
      return res.status(200).json({ response: "Test has been created successfully", questionData });
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
    const { course } = req.body;
    if (!req.file) return res.status(400).json({ response: "we cant the file" });
    if (!course) return res.status(400).json({ response: "please input the course" });
    const inputFile = `./${req.file.path}`;
    const outputFile = `./public/uploads/${req.file.filename}.csv`;
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

exports.chooseTest = async (req, res) => {
  const { time } = req.body;
  // if (!time) return res.status(400).json({ response: "Test time is required" });
  try {
    const finalTest = [];
    for (const [key, value] of Object.entries(req.body)) {
      const limit = parseInt(value);
      const test = await Tests.find({ course: "ESG", subTopics: `${key}` }).limit(limit);
      finalTest.push(...test);
    }

    const students = await Class.findOne({ _id: req.params.classId });
    console.log(students.student);
    const candidates = students.student.map((doc) => doc);
    console.log(candidates);

    const testDetails = {
      course: req.body.course,
      candidates,
      timer: time,
      classId: req.params.classId,
      testDetails: finalTest
    };
    return res.status(200).json({ response: "success", finalTest });
  } catch (error) {
    return res.status(500).json({ response: "An error occured", error });
  }
};

// upload a course questionBank which is an excel file
// name the file the name of the course we accept only xlsx file
// save to public/questionBank
// rename file to coursename.xlsx
// convert to coursename.csv then delete the coursename.xlsx file to avoid redundant files

// create test for a course
// we get the course from the questionBank
// searching with coursename
// tap into the file
// get out the topics and substopics
// return all the topics and suptopics underneath

// set the question for the test
// set the time for the time
// now get the questions from different subtopics and topics
// get the subtopic and number of questions from that topic
//
