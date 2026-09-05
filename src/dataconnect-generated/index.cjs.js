const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'noteit',
  location: 'asia-east2'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const createStudentRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateStudent');
}
createStudentRef.operationName = 'CreateStudent';
exports.createStudentRef = createStudentRef;

exports.createStudent = function createStudent(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(createStudentRef(dcInstance, inputVars));
}
;

const updateStudentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateStudent', inputVars);
}
updateStudentRef.operationName = 'UpdateStudent';
exports.updateStudentRef = updateStudentRef;

exports.updateStudent = function updateStudent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars);
  return executeMutation(updateStudentRef(dcInstance, inputVars));
}
;

const deleteStudentRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteStudent');
}
deleteStudentRef.operationName = 'DeleteStudent';
exports.deleteStudentRef = deleteStudentRef;

exports.deleteStudent = function deleteStudent(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(deleteStudentRef(dcInstance, inputVars));
}
;

const getMyStudentRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyStudent');
}
getMyStudentRef.operationName = 'GetMyStudent';
exports.getMyStudentRef = getMyStudentRef;

exports.getMyStudent = function getMyStudent(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyStudentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listStudentsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListStudents');
}
listStudentsRef.operationName = 'ListStudents';
exports.listStudentsRef = listStudentsRef;

exports.listStudents = function listStudents(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listStudentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createCourseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCourse', inputVars);
}
createCourseRef.operationName = 'CreateCourse';
exports.createCourseRef = createCourseRef;

exports.createCourse = function createCourse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCourseRef(dcInstance, inputVars));
}
;

const updateCourseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCourse', inputVars);
}
updateCourseRef.operationName = 'UpdateCourse';
exports.updateCourseRef = updateCourseRef;

exports.updateCourse = function updateCourse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCourseRef(dcInstance, inputVars));
}
;

const deleteCourseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCourse', inputVars);
}
deleteCourseRef.operationName = 'DeleteCourse';
exports.deleteCourseRef = deleteCourseRef;

exports.deleteCourse = function deleteCourse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteCourseRef(dcInstance, inputVars));
}
;

const getCourseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCourse', inputVars);
}
getCourseRef.operationName = 'GetCourse';
exports.getCourseRef = getCourseRef;

exports.getCourse = function getCourse(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCourseRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listMyCoursesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyCourses');
}
listMyCoursesRef.operationName = 'ListMyCourses';
exports.listMyCoursesRef = listMyCoursesRef;

exports.listMyCourses = function listMyCourses(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listMyCoursesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createLectureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLecture', inputVars);
}
createLectureRef.operationName = 'CreateLecture';
exports.createLectureRef = createLectureRef;

exports.createLecture = function createLecture(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createLectureRef(dcInstance, inputVars));
}
;

const updateLectureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLecture', inputVars);
}
updateLectureRef.operationName = 'UpdateLecture';
exports.updateLectureRef = updateLectureRef;

exports.updateLecture = function updateLecture(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateLectureRef(dcInstance, inputVars));
}
;

const deleteLectureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteLecture', inputVars);
}
deleteLectureRef.operationName = 'DeleteLecture';
exports.deleteLectureRef = deleteLectureRef;

exports.deleteLecture = function deleteLecture(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteLectureRef(dcInstance, inputVars));
}
;

const getLectureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLecture', inputVars);
}
getLectureRef.operationName = 'GetLecture';
exports.getLectureRef = getLectureRef;

exports.getLecture = function getLecture(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getLectureRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listLecturesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListLectures', inputVars);
}
listLecturesRef.operationName = 'ListLectures';
exports.listLecturesRef = listLecturesRef;

exports.listLectures = function listLectures(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listLecturesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNote', inputVars);
}
createNoteRef.operationName = 'CreateNote';
exports.createNoteRef = createNoteRef;

exports.createNote = function createNote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createNoteRef(dcInstance, inputVars));
}
;

const updateNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateNote', inputVars);
}
updateNoteRef.operationName = 'UpdateNote';
exports.updateNoteRef = updateNoteRef;

exports.updateNote = function updateNote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateNoteRef(dcInstance, inputVars));
}
;

const deleteNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteNote', inputVars);
}
deleteNoteRef.operationName = 'DeleteNote';
exports.deleteNoteRef = deleteNoteRef;

exports.deleteNote = function deleteNote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteNoteRef(dcInstance, inputVars));
}
;

const getNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNote', inputVars);
}
getNoteRef.operationName = 'GetNote';
exports.getNoteRef = getNoteRef;

exports.getNote = function getNote(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getNoteRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listNotesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListNotes', inputVars);
}
listNotesRef.operationName = 'ListNotes';
exports.listNotesRef = listNotesRef;

exports.listNotes = function listNotes(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listNotesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createFlashcardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFlashcard', inputVars);
}
createFlashcardRef.operationName = 'CreateFlashcard';
exports.createFlashcardRef = createFlashcardRef;

exports.createFlashcard = function createFlashcard(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFlashcardRef(dcInstance, inputVars));
}
;

const updateFlashcardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFlashcard', inputVars);
}
updateFlashcardRef.operationName = 'UpdateFlashcard';
exports.updateFlashcardRef = updateFlashcardRef;

exports.updateFlashcard = function updateFlashcard(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateFlashcardRef(dcInstance, inputVars));
}
;

const deleteFlashcardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteFlashcard', inputVars);
}
deleteFlashcardRef.operationName = 'DeleteFlashcard';
exports.deleteFlashcardRef = deleteFlashcardRef;

exports.deleteFlashcard = function deleteFlashcard(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteFlashcardRef(dcInstance, inputVars));
}
;

const getFlashcardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFlashcard', inputVars);
}
getFlashcardRef.operationName = 'GetFlashcard';
exports.getFlashcardRef = getFlashcardRef;

exports.getFlashcard = function getFlashcard(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getFlashcardRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listFlashcardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFlashcards', inputVars);
}
listFlashcardsRef.operationName = 'ListFlashcards';
exports.listFlashcardsRef = listFlashcardsRef;

exports.listFlashcards = function listFlashcards(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listFlashcardsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createReminderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateReminder', inputVars);
}
createReminderRef.operationName = 'CreateReminder';
exports.createReminderRef = createReminderRef;

exports.createReminder = function createReminder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createReminderRef(dcInstance, inputVars));
}
;

const updateReminderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateReminder', inputVars);
}
updateReminderRef.operationName = 'UpdateReminder';
exports.updateReminderRef = updateReminderRef;

exports.updateReminder = function updateReminder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateReminderRef(dcInstance, inputVars));
}
;

const deleteReminderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteReminder', inputVars);
}
deleteReminderRef.operationName = 'DeleteReminder';
exports.deleteReminderRef = deleteReminderRef;

exports.deleteReminder = function deleteReminder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteReminderRef(dcInstance, inputVars));
}
;

const getReminderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetReminder', inputVars);
}
getReminderRef.operationName = 'GetReminder';
exports.getReminderRef = getReminderRef;

exports.getReminder = function getReminder(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getReminderRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listMyRemindersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyReminders');
}
listMyRemindersRef.operationName = 'ListMyReminders';
exports.listMyRemindersRef = listMyRemindersRef;

exports.listMyReminders = function listMyReminders(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listMyRemindersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
