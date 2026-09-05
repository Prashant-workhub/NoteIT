import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

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

/** Generated Node Admin SDK operation action function for the 'CreateStudent' Mutation. Allow users to execute without passing in DataConnect. */
export function createStudent(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateStudentData>>;
/** Generated Node Admin SDK operation action function for the 'CreateStudent' Mutation. Allow users to pass in custom DataConnect instances. */
export function createStudent(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateStudentData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateStudent' Mutation. Allow users to execute without passing in DataConnect. */
export function updateStudent(dc: DataConnect, vars?: UpdateStudentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateStudentData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateStudent' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateStudent(vars?: UpdateStudentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateStudentData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteStudent' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteStudent(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteStudentData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteStudent' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteStudent(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteStudentData>>;

/** Generated Node Admin SDK operation action function for the 'GetMyStudent' Query. Allow users to execute without passing in DataConnect. */
export function getMyStudent(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyStudentData>>;
/** Generated Node Admin SDK operation action function for the 'GetMyStudent' Query. Allow users to pass in custom DataConnect instances. */
export function getMyStudent(options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyStudentData>>;

/** Generated Node Admin SDK operation action function for the 'ListStudents' Query. Allow users to execute without passing in DataConnect. */
export function listStudents(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListStudentsData>>;
/** Generated Node Admin SDK operation action function for the 'ListStudents' Query. Allow users to pass in custom DataConnect instances. */
export function listStudents(options?: OperationOptions): Promise<ExecuteOperationResponse<ListStudentsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCourse' Mutation. Allow users to execute without passing in DataConnect. */
export function createCourse(dc: DataConnect, vars: CreateCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCourseData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCourse' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCourse(vars: CreateCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCourseData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateCourse' Mutation. Allow users to execute without passing in DataConnect. */
export function updateCourse(dc: DataConnect, vars: UpdateCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateCourseData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateCourse' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateCourse(vars: UpdateCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateCourseData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteCourse' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteCourse(dc: DataConnect, vars: DeleteCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteCourseData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteCourse' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteCourse(vars: DeleteCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteCourseData>>;

/** Generated Node Admin SDK operation action function for the 'GetCourse' Query. Allow users to execute without passing in DataConnect. */
export function getCourse(dc: DataConnect, vars: GetCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCourseData>>;
/** Generated Node Admin SDK operation action function for the 'GetCourse' Query. Allow users to pass in custom DataConnect instances. */
export function getCourse(vars: GetCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCourseData>>;

/** Generated Node Admin SDK operation action function for the 'ListMyCourses' Query. Allow users to execute without passing in DataConnect. */
export function listMyCourses(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyCoursesData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyCourses' Query. Allow users to pass in custom DataConnect instances. */
export function listMyCourses(options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyCoursesData>>;

/** Generated Node Admin SDK operation action function for the 'CreateLecture' Mutation. Allow users to execute without passing in DataConnect. */
export function createLecture(dc: DataConnect, vars: CreateLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateLectureData>>;
/** Generated Node Admin SDK operation action function for the 'CreateLecture' Mutation. Allow users to pass in custom DataConnect instances. */
export function createLecture(vars: CreateLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateLectureData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateLecture' Mutation. Allow users to execute without passing in DataConnect. */
export function updateLecture(dc: DataConnect, vars: UpdateLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLectureData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateLecture' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateLecture(vars: UpdateLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLectureData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteLecture' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteLecture(dc: DataConnect, vars: DeleteLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteLectureData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteLecture' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteLecture(vars: DeleteLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteLectureData>>;

/** Generated Node Admin SDK operation action function for the 'GetLecture' Query. Allow users to execute without passing in DataConnect. */
export function getLecture(dc: DataConnect, vars: GetLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetLectureData>>;
/** Generated Node Admin SDK operation action function for the 'GetLecture' Query. Allow users to pass in custom DataConnect instances. */
export function getLecture(vars: GetLectureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetLectureData>>;

/** Generated Node Admin SDK operation action function for the 'ListLectures' Query. Allow users to execute without passing in DataConnect. */
export function listLectures(dc: DataConnect, vars: ListLecturesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListLecturesData>>;
/** Generated Node Admin SDK operation action function for the 'ListLectures' Query. Allow users to pass in custom DataConnect instances. */
export function listLectures(vars: ListLecturesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListLecturesData>>;

/** Generated Node Admin SDK operation action function for the 'CreateNote' Mutation. Allow users to execute without passing in DataConnect. */
export function createNote(dc: DataConnect, vars: CreateNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNoteData>>;
/** Generated Node Admin SDK operation action function for the 'CreateNote' Mutation. Allow users to pass in custom DataConnect instances. */
export function createNote(vars: CreateNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNoteData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateNote' Mutation. Allow users to execute without passing in DataConnect. */
export function updateNote(dc: DataConnect, vars: UpdateNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateNoteData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateNote' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateNote(vars: UpdateNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateNoteData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteNote' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteNote(dc: DataConnect, vars: DeleteNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteNoteData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteNote' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteNote(vars: DeleteNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteNoteData>>;

/** Generated Node Admin SDK operation action function for the 'GetNote' Query. Allow users to execute without passing in DataConnect. */
export function getNote(dc: DataConnect, vars: GetNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetNoteData>>;
/** Generated Node Admin SDK operation action function for the 'GetNote' Query. Allow users to pass in custom DataConnect instances. */
export function getNote(vars: GetNoteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetNoteData>>;

/** Generated Node Admin SDK operation action function for the 'ListNotes' Query. Allow users to execute without passing in DataConnect. */
export function listNotes(dc: DataConnect, vars: ListNotesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListNotesData>>;
/** Generated Node Admin SDK operation action function for the 'ListNotes' Query. Allow users to pass in custom DataConnect instances. */
export function listNotes(vars: ListNotesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListNotesData>>;

/** Generated Node Admin SDK operation action function for the 'CreateFlashcard' Mutation. Allow users to execute without passing in DataConnect. */
export function createFlashcard(dc: DataConnect, vars: CreateFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateFlashcardData>>;
/** Generated Node Admin SDK operation action function for the 'CreateFlashcard' Mutation. Allow users to pass in custom DataConnect instances. */
export function createFlashcard(vars: CreateFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateFlashcardData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateFlashcard' Mutation. Allow users to execute without passing in DataConnect. */
export function updateFlashcard(dc: DataConnect, vars: UpdateFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateFlashcardData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateFlashcard' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateFlashcard(vars: UpdateFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateFlashcardData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteFlashcard' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteFlashcard(dc: DataConnect, vars: DeleteFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteFlashcardData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteFlashcard' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteFlashcard(vars: DeleteFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteFlashcardData>>;

/** Generated Node Admin SDK operation action function for the 'GetFlashcard' Query. Allow users to execute without passing in DataConnect. */
export function getFlashcard(dc: DataConnect, vars: GetFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetFlashcardData>>;
/** Generated Node Admin SDK operation action function for the 'GetFlashcard' Query. Allow users to pass in custom DataConnect instances. */
export function getFlashcard(vars: GetFlashcardVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetFlashcardData>>;

/** Generated Node Admin SDK operation action function for the 'ListFlashcards' Query. Allow users to execute without passing in DataConnect. */
export function listFlashcards(dc: DataConnect, vars: ListFlashcardsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListFlashcardsData>>;
/** Generated Node Admin SDK operation action function for the 'ListFlashcards' Query. Allow users to pass in custom DataConnect instances. */
export function listFlashcards(vars: ListFlashcardsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListFlashcardsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateReminder' Mutation. Allow users to execute without passing in DataConnect. */
export function createReminder(dc: DataConnect, vars: CreateReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateReminderData>>;
/** Generated Node Admin SDK operation action function for the 'CreateReminder' Mutation. Allow users to pass in custom DataConnect instances. */
export function createReminder(vars: CreateReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateReminderData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateReminder' Mutation. Allow users to execute without passing in DataConnect. */
export function updateReminder(dc: DataConnect, vars: UpdateReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateReminderData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateReminder' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateReminder(vars: UpdateReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateReminderData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteReminder' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteReminder(dc: DataConnect, vars: DeleteReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteReminderData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteReminder' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteReminder(vars: DeleteReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteReminderData>>;

/** Generated Node Admin SDK operation action function for the 'GetReminder' Query. Allow users to execute without passing in DataConnect. */
export function getReminder(dc: DataConnect, vars: GetReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetReminderData>>;
/** Generated Node Admin SDK operation action function for the 'GetReminder' Query. Allow users to pass in custom DataConnect instances. */
export function getReminder(vars: GetReminderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetReminderData>>;

/** Generated Node Admin SDK operation action function for the 'ListMyReminders' Query. Allow users to execute without passing in DataConnect. */
export function listMyReminders(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyRemindersData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyReminders' Query. Allow users to pass in custom DataConnect instances. */
export function listMyReminders(options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyRemindersData>>;

