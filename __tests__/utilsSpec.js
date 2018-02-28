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

test('breakQueryIntoSubQueries test 1 - less than 2 queries', () => {
  var paths = [["hello", "world"]];
  var maxSize = 7000;
  var actual = breakQueryIntoSubQueries(paths, maxSize);
  var expected = [[["hello", "world"]]]
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('breakQueryIntoSubQueries test 2 - should split due to size' , () => {
  var paths = [["hello", "world"],["hello", "world2"],["hello", "world3"]];
  var maxSize = 5;
  var actual = breakQueryIntoSubQueries(paths, maxSize);
  var expected = [[["hello", "world"],["hello", "world2"]], [["hello", "world3"]]]
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('breakQueryIntoSubQueries test 3 - should split due to size again' , () => {
  var paths = [["hello", "world"],["hello", "world2"],["hello", "world3"],["hello", "world4"],["hello", "world5"]];
  var maxSize = 5;
  var actual = breakQueryIntoSubQueries(paths, maxSize);
  var expected = [[["hello", "world"],["hello", "world2"]], [["hello", "world3"]], [["hello", "world4"],["hello", "world5"]]]
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});

test('breakQueryIntoSubQueries test 4 - should not split due to size' , () => {
  var paths = [["hello", "world"],["hello", "world2"],["hello", "world3"],["hello", "world4"],["hello", "world5"]];
  var maxSize = 7000;
  var actual = breakQueryIntoSubQueries(paths, maxSize);
  var expected = [[["hello", "world"],["hello", "world2"], ["hello", "world3"], ["hello", "world4"],["hello", "world5"]]]
  expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});
