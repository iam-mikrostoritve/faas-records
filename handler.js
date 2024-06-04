"use strict";

const AWS = require("aws-sdk");
const uuid = require("uuid");

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: "http://localhost:4566", // Localstack DynamoDB endpoint
  region: "us-east-1",
});

const TABLE_NAME = process.env.EVENTS_TABLE;

// Create Record
module.exports.createRecord = async (record) => {
  const { title, description, date } = JSON.parse(record.body);
  const id = uuid.v4();
  const newRecord = { id, title, description, date };
  await docClient
    .put({
      TableName: TABLE_NAME,
      Item: newRecord,
    })
    .promise();
  return {
    statusCode: 201,
    body: JSON.stringify(newRecord),
  };
};

// Get All Records
module.exports.getRecords = async () => {
  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items),
  };
};

// Get Record by ID
module.exports.getRecordById = async (record) => {
  const { id } = record.pathParameters;
  const data = await docClient
    .get({
      TableName: TABLE_NAME,
      Key: { id },
    })
    .promise();
  if (!data.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Record not found" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(data.Item),
  };
};

// Update Record
module.exports.updateRecord = async (record) => {
  const { id } = record.pathParameters;
  const { title, description, date } = JSON.parse(record.body);
  await docClient
    .update({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression:
        "set title = :title, description = :description, date = :date",
      ExpressionAttributeValues: {
        ":title": title,
        ":description": description,
        ":date": date,
      },
    })
    .promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ id, title, description, date }),
  };
};

// Delete Record
module.exports.deleteRecord = async (record) => {
  const { id } = record.pathParameters;
  await docClient
    .delete({
      TableName: TABLE_NAME,
      Key: { id },
    })
    .promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Record deleted successfully" }),
  };
};
