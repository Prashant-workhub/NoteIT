import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Course_Key {
  id: UUIDString;
  __typename?: 'Course_Key';
}

export interface CreateCourseData {
  course_insert: Course_Key;
}

export interface CreateCourseVariables {
  title: string;
  code: string;
}

export interface CreateFlashcardData {
  flashcard_insert: Flashcard_Key;
}

export interface CreateFlashcardVariables {
  question: string;
  answer: string;
  noteId: UUIDString;
}

export interface CreateLectureData {
  lecture_insert: Lecture_Key;
}

export interface CreateLectureVariables {
  topic: string;
  date: DateString;
  courseId: UUIDString;
}

export interface CreateNoteData {
  note_insert: Note_Key;
}

export interface CreateNoteVariables {
  rawContent: string;
  summaryContent: string;
  lectureId: UUIDString;
}

export interface CreateReminderData {
  reminder_insert: Reminder_Key;
}

export interface CreateReminderVariables {
  title: string;
  dueDate: TimestampString;
  courseId: UUIDString;
}

export interface CreateStudentData {
  student_insert: Student_Key;
}

export interface DeleteCourseData {
  course_delete?: Course_Key | null;
}

export interface DeleteCourseVariables {
  id: UUIDString;
}

export interface DeleteFlashcardData {
  flashcard_delete?: Flashcard_Key | null;
}

export interface DeleteFlashcardVariables {
  id: UUIDString;
}

export interface DeleteLectureData {
  lecture_delete?: Lecture_Key | null;
}

export interface DeleteLectureVariables {
  id: UUIDString;
}

export interface DeleteNoteData {
  note_delete?: Note_Key | null;
}

export interface DeleteNoteVariables {
  id: UUIDString;
}

export interface DeleteReminderData {
  reminder_delete?: Reminder_Key | null;
}

export interface DeleteReminderVariables {
  id: UUIDString;
}

export interface DeleteStudentData {
  student_delete?: Student_Key | null;
}

export interface Flashcard_Key {
  id: UUIDString;
  __typename?: 'Flashcard_Key';
}

export interface GetCourseData {
  course?: {
    title: string;
    code: string;
  };
}

export interface GetCourseVariables {
  id: UUIDString;
}

export interface GetFlashcardData {
  flashcard?: {
    question: string;
    answer: string;
  };
}

export interface GetFlashcardVariables {
  id: UUIDString;
}

export interface GetLectureData {
  lecture?: {
    topic: string;
    date: DateString;
  };
}

export interface GetLectureVariables {
  id: UUIDString;
}

export interface GetMyStudentData {
  student?: {
    name: string;
    email: string;
  };
}

export interface GetNoteData {
  note?: {
    rawContent: string;
    summaryContent: string;
  };
}

export interface GetNoteVariables {
  id: UUIDString;
}

export interface GetReminderData {
  reminder?: {
    title: string;
    dueDate: TimestampString;
  };
}

export interface GetReminderVariables {
  id: UUIDString;
}

export interface Lecture_Key {
  id: UUIDString;
  __typename?: 'Lecture_Key';
}

export interface ListFlashcardsData {
  flashcards: ({
    question: string;
    answer: string;
  })[];
}

export interface ListFlashcardsVariables {
  noteId: UUIDString;
}

export interface ListLecturesData {
  lectures: ({
    topic: string;
    date: DateString;
  })[];
}

export interface ListLecturesVariables {
  courseId: UUIDString;
}

export interface ListMyCoursesData {
  courses: ({
    title: string;
    code: string;
  })[];
}

export interface ListMyRemindersData {
  reminders: ({
    title: string;
    dueDate: TimestampString;
  })[];
}

export interface ListNotesData {
  notes: ({
    summaryContent: string;
  })[];
}

export interface ListNotesVariables {
  lectureId: UUIDString;
}

export interface ListStudentsData {
  students: ({
    name: string;
    universityName?: string | null;
  })[];
}

export interface Note_Key {
  id: UUIDString;
  __typename?: 'Note_Key';
}

export interface Reminder_Key {
  id: UUIDString;
  __typename?: 'Reminder_Key';
}

export interface Student_Key {
  id: UUIDString;
  __typename?: 'Student_Key';
}

export interface UpdateCourseData {
  course_update?: Course_Key | null;
}

export interface UpdateCourseVariables {
  id: UUIDString;
  title?: string | null;
}

export interface UpdateFlashcardData {
  flashcard_update?: Flashcard_Key | null;
}

export interface UpdateFlashcardVariables {
  id: UUIDString;
  answer?: string | null;
}

export interface UpdateLectureData {
  lecture_update?: Lecture_Key | null;
}

export interface UpdateLectureVariables {
  id: UUIDString;
  topic?: string | null;
}

export interface UpdateNoteData {
  note_update?: Note_Key | null;
}

export interface UpdateNoteVariables {
  id: UUIDString;
  summary?: string | null;
}

export interface UpdateReminderData {
  reminder_update?: Reminder_Key | null;
}

export interface UpdateReminderVariables {
  id: UUIDString;
  title?: string | null;
}

export interface UpdateStudentData {
  student_update?: Student_Key | null;
}

export interface UpdateStudentVariables {
  name?: string | null;
}

interface CreateStudentRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateStudentData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateStudentData, undefined>;
  operationName: string;
}
export const createStudentRef: CreateStudentRef;

export function createStudent(): MutationPromise<CreateStudentData, undefined>;
export function createStudent(dc: DataConnect): MutationPromise<CreateStudentData, undefined>;

interface UpdateStudentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpdateStudentVariables): MutationRef<UpdateStudentData, UpdateStudentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: UpdateStudentVariables): MutationRef<UpdateStudentData, UpdateStudentVariables>;
  operationName: string;
}
export const updateStudentRef: UpdateStudentRef;

export function updateStudent(vars?: UpdateStudentVariables): MutationPromise<UpdateStudentData, UpdateStudentVariables>;
export function updateStudent(dc: DataConnect, vars?: UpdateStudentVariables): MutationPromise<UpdateStudentData, UpdateStudentVariables>;

interface DeleteStudentRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteStudentData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteStudentData, undefined>;
  operationName: string;
}
export const deleteStudentRef: DeleteStudentRef;

export function deleteStudent(): MutationPromise<DeleteStudentData, undefined>;
export function deleteStudent(dc: DataConnect): MutationPromise<DeleteStudentData, undefined>;

interface GetMyStudentRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyStudentData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyStudentData, undefined>;
  operationName: string;
}
export const getMyStudentRef: GetMyStudentRef;

export function getMyStudent(options?: ExecuteQueryOptions): QueryPromise<GetMyStudentData, undefined>;
export function getMyStudent(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyStudentData, undefined>;

interface ListStudentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListStudentsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListStudentsData, undefined>;
  operationName: string;
}
export const listStudentsRef: ListStudentsRef;

export function listStudents(options?: ExecuteQueryOptions): QueryPromise<ListStudentsData, undefined>;
export function listStudents(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListStudentsData, undefined>;

interface CreateCourseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCourseVariables): MutationRef<CreateCourseData, CreateCourseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCourseVariables): MutationRef<CreateCourseData, CreateCourseVariables>;
  operationName: string;
}
export const createCourseRef: CreateCourseRef;

export function createCourse(vars: CreateCourseVariables): MutationPromise<CreateCourseData, CreateCourseVariables>;
export function createCourse(dc: DataConnect, vars: CreateCourseVariables): MutationPromise<CreateCourseData, CreateCourseVariables>;

interface UpdateCourseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCourseVariables): MutationRef<UpdateCourseData, UpdateCourseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCourseVariables): MutationRef<UpdateCourseData, UpdateCourseVariables>;
  operationName: string;
}
export const updateCourseRef: UpdateCourseRef;

export function updateCourse(vars: UpdateCourseVariables): MutationPromise<UpdateCourseData, UpdateCourseVariables>;
export function updateCourse(dc: DataConnect, vars: UpdateCourseVariables): MutationPromise<UpdateCourseData, UpdateCourseVariables>;

interface DeleteCourseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCourseVariables): MutationRef<DeleteCourseData, DeleteCourseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCourseVariables): MutationRef<DeleteCourseData, DeleteCourseVariables>;
  operationName: string;
}
export const deleteCourseRef: DeleteCourseRef;

export function deleteCourse(vars: DeleteCourseVariables): MutationPromise<DeleteCourseData, DeleteCourseVariables>;
export function deleteCourse(dc: DataConnect, vars: DeleteCourseVariables): MutationPromise<DeleteCourseData, DeleteCourseVariables>;

interface GetCourseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCourseVariables): QueryRef<GetCourseData, GetCourseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCourseVariables): QueryRef<GetCourseData, GetCourseVariables>;
  operationName: string;
}
export const getCourseRef: GetCourseRef;

export function getCourse(vars: GetCourseVariables, options?: ExecuteQueryOptions): QueryPromise<GetCourseData, GetCourseVariables>;
export function getCourse(dc: DataConnect, vars: GetCourseVariables, options?: ExecuteQueryOptions): QueryPromise<GetCourseData, GetCourseVariables>;

interface ListMyCoursesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyCoursesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyCoursesData, undefined>;
  operationName: string;
}
export const listMyCoursesRef: ListMyCoursesRef;

export function listMyCourses(options?: ExecuteQueryOptions): QueryPromise<ListMyCoursesData, undefined>;
export function listMyCourses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyCoursesData, undefined>;

interface CreateLectureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLectureVariables): MutationRef<CreateLectureData, CreateLectureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLectureVariables): MutationRef<CreateLectureData, CreateLectureVariables>;
  operationName: string;
}
export const createLectureRef: CreateLectureRef;

export function createLecture(vars: CreateLectureVariables): MutationPromise<CreateLectureData, CreateLectureVariables>;
export function createLecture(dc: DataConnect, vars: CreateLectureVariables): MutationPromise<CreateLectureData, CreateLectureVariables>;

interface UpdateLectureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLectureVariables): MutationRef<UpdateLectureData, UpdateLectureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLectureVariables): MutationRef<UpdateLectureData, UpdateLectureVariables>;
  operationName: string;
}
export const updateLectureRef: UpdateLectureRef;

export function updateLecture(vars: UpdateLectureVariables): MutationPromise<UpdateLectureData, UpdateLectureVariables>;
export function updateLecture(dc: DataConnect, vars: UpdateLectureVariables): MutationPromise<UpdateLectureData, UpdateLectureVariables>;

interface DeleteLectureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLectureVariables): MutationRef<DeleteLectureData, DeleteLectureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteLectureVariables): MutationRef<DeleteLectureData, DeleteLectureVariables>;
  operationName: string;
}
export const deleteLectureRef: DeleteLectureRef;

export function deleteLecture(vars: DeleteLectureVariables): MutationPromise<DeleteLectureData, DeleteLectureVariables>;
export function deleteLecture(dc: DataConnect, vars: DeleteLectureVariables): MutationPromise<DeleteLectureData, DeleteLectureVariables>;

interface GetLectureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLectureVariables): QueryRef<GetLectureData, GetLectureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLectureVariables): QueryRef<GetLectureData, GetLectureVariables>;
  operationName: string;
}
export const getLectureRef: GetLectureRef;

export function getLecture(vars: GetLectureVariables, options?: ExecuteQueryOptions): QueryPromise<GetLectureData, GetLectureVariables>;
export function getLecture(dc: DataConnect, vars: GetLectureVariables, options?: ExecuteQueryOptions): QueryPromise<GetLectureData, GetLectureVariables>;

interface ListLecturesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListLecturesVariables): QueryRef<ListLecturesData, ListLecturesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListLecturesVariables): QueryRef<ListLecturesData, ListLecturesVariables>;
  operationName: string;
}
export const listLecturesRef: ListLecturesRef;

export function listLectures(vars: ListLecturesVariables, options?: ExecuteQueryOptions): QueryPromise<ListLecturesData, ListLecturesVariables>;
export function listLectures(dc: DataConnect, vars: ListLecturesVariables, options?: ExecuteQueryOptions): QueryPromise<ListLecturesData, ListLecturesVariables>;

interface CreateNoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
  operationName: string;
}
export const createNoteRef: CreateNoteRef;

export function createNote(vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;
export function createNote(dc: DataConnect, vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;

interface UpdateNoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateNoteVariables): MutationRef<UpdateNoteData, UpdateNoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateNoteVariables): MutationRef<UpdateNoteData, UpdateNoteVariables>;
  operationName: string;
}
export const updateNoteRef: UpdateNoteRef;

export function updateNote(vars: UpdateNoteVariables): MutationPromise<UpdateNoteData, UpdateNoteVariables>;
export function updateNote(dc: DataConnect, vars: UpdateNoteVariables): MutationPromise<UpdateNoteData, UpdateNoteVariables>;

interface DeleteNoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteNoteVariables): MutationRef<DeleteNoteData, DeleteNoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteNoteVariables): MutationRef<DeleteNoteData, DeleteNoteVariables>;
  operationName: string;
}
export const deleteNoteRef: DeleteNoteRef;

export function deleteNote(vars: DeleteNoteVariables): MutationPromise<DeleteNoteData, DeleteNoteVariables>;
export function deleteNote(dc: DataConnect, vars: DeleteNoteVariables): MutationPromise<DeleteNoteData, DeleteNoteVariables>;

interface GetNoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNoteVariables): QueryRef<GetNoteData, GetNoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetNoteVariables): QueryRef<GetNoteData, GetNoteVariables>;
  operationName: string;
}
export const getNoteRef: GetNoteRef;

export function getNote(vars: GetNoteVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoteData, GetNoteVariables>;
export function getNote(dc: DataConnect, vars: GetNoteVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoteData, GetNoteVariables>;

interface ListNotesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListNotesVariables): QueryRef<ListNotesData, ListNotesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListNotesVariables): QueryRef<ListNotesData, ListNotesVariables>;
  operationName: string;
}
export const listNotesRef: ListNotesRef;

export function listNotes(vars: ListNotesVariables, options?: ExecuteQueryOptions): QueryPromise<ListNotesData, ListNotesVariables>;
export function listNotes(dc: DataConnect, vars: ListNotesVariables, options?: ExecuteQueryOptions): QueryPromise<ListNotesData, ListNotesVariables>;

interface CreateFlashcardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFlashcardVariables): MutationRef<CreateFlashcardData, CreateFlashcardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFlashcardVariables): MutationRef<CreateFlashcardData, CreateFlashcardVariables>;
  operationName: string;
}
export const createFlashcardRef: CreateFlashcardRef;

export function createFlashcard(vars: CreateFlashcardVariables): MutationPromise<CreateFlashcardData, CreateFlashcardVariables>;
export function createFlashcard(dc: DataConnect, vars: CreateFlashcardVariables): MutationPromise<CreateFlashcardData, CreateFlashcardVariables>;

interface UpdateFlashcardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFlashcardVariables): MutationRef<UpdateFlashcardData, UpdateFlashcardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFlashcardVariables): MutationRef<UpdateFlashcardData, UpdateFlashcardVariables>;
  operationName: string;
}
export const updateFlashcardRef: UpdateFlashcardRef;

export function updateFlashcard(vars: UpdateFlashcardVariables): MutationPromise<UpdateFlashcardData, UpdateFlashcardVariables>;
export function updateFlashcard(dc: DataConnect, vars: UpdateFlashcardVariables): MutationPromise<UpdateFlashcardData, UpdateFlashcardVariables>;

interface DeleteFlashcardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteFlashcardVariables): MutationRef<DeleteFlashcardData, DeleteFlashcardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteFlashcardVariables): MutationRef<DeleteFlashcardData, DeleteFlashcardVariables>;
  operationName: string;
}
export const deleteFlashcardRef: DeleteFlashcardRef;

export function deleteFlashcard(vars: DeleteFlashcardVariables): MutationPromise<DeleteFlashcardData, DeleteFlashcardVariables>;
export function deleteFlashcard(dc: DataConnect, vars: DeleteFlashcardVariables): MutationPromise<DeleteFlashcardData, DeleteFlashcardVariables>;

interface GetFlashcardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFlashcardVariables): QueryRef<GetFlashcardData, GetFlashcardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFlashcardVariables): QueryRef<GetFlashcardData, GetFlashcardVariables>;
  operationName: string;
}
export const getFlashcardRef: GetFlashcardRef;

export function getFlashcard(vars: GetFlashcardVariables, options?: ExecuteQueryOptions): QueryPromise<GetFlashcardData, GetFlashcardVariables>;
export function getFlashcard(dc: DataConnect, vars: GetFlashcardVariables, options?: ExecuteQueryOptions): QueryPromise<GetFlashcardData, GetFlashcardVariables>;

interface ListFlashcardsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListFlashcardsVariables): QueryRef<ListFlashcardsData, ListFlashcardsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListFlashcardsVariables): QueryRef<ListFlashcardsData, ListFlashcardsVariables>;
  operationName: string;
}
export const listFlashcardsRef: ListFlashcardsRef;

export function listFlashcards(vars: ListFlashcardsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFlashcardsData, ListFlashcardsVariables>;
export function listFlashcards(dc: DataConnect, vars: ListFlashcardsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFlashcardsData, ListFlashcardsVariables>;

interface CreateReminderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateReminderVariables): MutationRef<CreateReminderData, CreateReminderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateReminderVariables): MutationRef<CreateReminderData, CreateReminderVariables>;
  operationName: string;
}
export const createReminderRef: CreateReminderRef;

export function createReminder(vars: CreateReminderVariables): MutationPromise<CreateReminderData, CreateReminderVariables>;
export function createReminder(dc: DataConnect, vars: CreateReminderVariables): MutationPromise<CreateReminderData, CreateReminderVariables>;

interface UpdateReminderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateReminderVariables): MutationRef<UpdateReminderData, UpdateReminderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateReminderVariables): MutationRef<UpdateReminderData, UpdateReminderVariables>;
  operationName: string;
}
export const updateReminderRef: UpdateReminderRef;

export function updateReminder(vars: UpdateReminderVariables): MutationPromise<UpdateReminderData, UpdateReminderVariables>;
export function updateReminder(dc: DataConnect, vars: UpdateReminderVariables): MutationPromise<UpdateReminderData, UpdateReminderVariables>;

interface DeleteReminderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteReminderVariables): MutationRef<DeleteReminderData, DeleteReminderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteReminderVariables): MutationRef<DeleteReminderData, DeleteReminderVariables>;
  operationName: string;
}
export const deleteReminderRef: DeleteReminderRef;

export function deleteReminder(vars: DeleteReminderVariables): MutationPromise<DeleteReminderData, DeleteReminderVariables>;
export function deleteReminder(dc: DataConnect, vars: DeleteReminderVariables): MutationPromise<DeleteReminderData, DeleteReminderVariables>;

interface GetReminderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetReminderVariables): QueryRef<GetReminderData, GetReminderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetReminderVariables): QueryRef<GetReminderData, GetReminderVariables>;
  operationName: string;
}
export const getReminderRef: GetReminderRef;

export function getReminder(vars: GetReminderVariables, options?: ExecuteQueryOptions): QueryPromise<GetReminderData, GetReminderVariables>;
export function getReminder(dc: DataConnect, vars: GetReminderVariables, options?: ExecuteQueryOptions): QueryPromise<GetReminderData, GetReminderVariables>;

interface ListMyRemindersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyRemindersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyRemindersData, undefined>;
  operationName: string;
}
export const listMyRemindersRef: ListMyRemindersRef;

export function listMyReminders(options?: ExecuteQueryOptions): QueryPromise<ListMyRemindersData, undefined>;
export function listMyReminders(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyRemindersData, undefined>;

