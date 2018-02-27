var {mergeResponses, breakQueryIntoSubQueries} = require("../src/utils");


test('merge test 1', () => {
  var expected = {};
  var source = {};
  var destination = {};
  var actual = mergeResponses(source, destination)
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('merge test 2', () => {
  var expected = {a:1};
  var source = {a:1};
  var destination = {};
  var actual = mergeResponses(source, destination)
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('merge test 3', () => {
  var expected = {a:{b:1}};
  var source = {a:{b:1}};
  var destination = {};
  var actual = mergeResponses(source, destination)
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('merge test 3', () => {
  var expected = {a:"stuff"};
  var source = {a:"stuff"};
  var destination = {};
  var actual = mergeResponses(source, destination)
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('merge test 3', () => {
  var expected = {a:{b:"more"}, c:"stuff"};
  var source = {a:{b:"more"}, c:"stuff"};
  var destination = {};
  var actual = mergeResponses(source, destination)
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('merge test 4', () => {
  var expected = {a:{b:"more"}, c:"stuff"};
  var source = { c:"stuff"};
  var destination = {a:{b:"more"}};
  var actual = mergeResponses(source, destination)
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('merge test 5', () => {
  var expected = {a:{b:"more", c:"stuff"}};
  var source = {a:{c:"stuff"}};
  var destination = {a:{b:"more"}};
  var actual = mergeResponses(source, destination)
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});
