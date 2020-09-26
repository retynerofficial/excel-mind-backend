const csvToJson = require("csvtojson");
const fs = require("fs");
const path = require("path");
const QuestionBank = require("../models/questionBank");

const { toCsv } = require("../config/converter");
const Tests = require("../models/tests");

exports.createTest = async (req, res) => {
  try {
    const { course } = req.body;
    let questionData;
    const getQuestions = await QuestionBank.findOne({ course });
    if (getQuestions) {
      const csvFilePath = getQuestions.location;
      console.log("csvFilePath", csvFilePath);

      const jsonArray = await csvToJson().fromFile(csvFilePath);
      // console.log(jsonArray);
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
    return res.status(500).json({ response: "An error occured", error });
  }
};

// question bank upoading is done
exports.questionBank = async (req, res) => {
  const { course } = req.body;
  const inputFile = `./${req.file.path}`;
  const outputFile = `./public/uploads/${req.file.filename}.csv`;
  const csv = toCsv(inputFile, outputFile);
  if (csv !== "error") {
    const questionBankDetails = {
      course,
      location: outputFile
    };
    QuestionBank.create(questionBankDetails).then((result) => {
      console.log(result);
    });
  }
  // deletes the questionBank from the folder to prevent redundant files
  fs.unlinkSync(inputFile);
  res.json({ response: "file uploaded", csv });
};

exports.pickTest = async (req, res) => {
  const { course } = req.body;
  try {
    const test = await Tests.find({ course });
    const topicssubtopic = test.map((doc) => ({
      topic: doc.topic,
      subTopic: doc.subTopics
    }));
    return res.status(200).json({
      response:
        topicssubtopic

    });
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
