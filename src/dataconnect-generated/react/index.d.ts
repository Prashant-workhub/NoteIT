import { CreateStudentData, UpdateStudentData, UpdateStudentVariables, DeleteStudentData, GetMyStudentData, ListStudentsData, CreateCourseData, CreateCourseVariables, UpdateCourseData, UpdateCourseVariables, DeleteCourseData, DeleteCourseVariables, GetCourseData, GetCourseVariables, ListMyCoursesData, CreateLectureData, CreateLectureVariables, UpdateLectureData, UpdateLectureVariables, DeleteLectureData, DeleteLectureVariables, GetLectureData, GetLectureVariables, ListLecturesData, ListLecturesVariables, CreateNoteData, CreateNoteVariables, UpdateNoteData, UpdateNoteVariables, DeleteNoteData, DeleteNoteVariables, GetNoteData, GetNoteVariables, ListNotesData, ListNotesVariables, CreateFlashcardData, CreateFlashcardVariables, UpdateFlashcardData, UpdateFlashcardVariables, DeleteFlashcardData, DeleteFlashcardVariables, GetFlashcardData, GetFlashcardVariables, ListFlashcardsData, ListFlashcardsVariables, CreateReminderData, CreateReminderVariables, UpdateReminderData, UpdateReminderVariables, DeleteReminderData, DeleteReminderVariables, GetReminderData, GetReminderVariables, ListMyRemindersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateStudent(options?: useDataConnectMutationOptions<CreateStudentData, FirebaseError, void>): UseDataConnectMutationResult<CreateStudentData, undefined>;
export function useCreateStudent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateStudentData, FirebaseError, void>): UseDataConnectMutationResult<CreateStudentData, undefined>;

export function useUpdateStudent(options?: useDataConnectMutationOptions<UpdateStudentData, FirebaseError, UpdateStudentVariables | void>): UseDataConnectMutationResult<UpdateStudentData, UpdateStudentVariables>;
export function useUpdateStudent(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateStudentData, FirebaseError, UpdateStudentVariables | void>): UseDataConnectMutationResult<UpdateStudentData, UpdateStudentVariables>;

export function useDeleteStudent(options?: useDataConnectMutationOptions<DeleteStudentData, FirebaseError, void>): UseDataConnectMutationResult<DeleteStudentData, undefined>;
export function useDeleteStudent(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteStudentData, FirebaseError, void>): UseDataConnectMutationResult<DeleteStudentData, undefined>;

export function useGetMyStudent(options?: useDataConnectQueryOptions<GetMyStudentData>): UseDataConnectQueryResult<GetMyStudentData, undefined>;
export function useGetMyStudent(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyStudentData>): UseDataConnectQueryResult<GetMyStudentData, undefined>;

export function useListStudents(options?: useDataConnectQueryOptions<ListStudentsData>): UseDataConnectQueryResult<ListStudentsData, undefined>;
export function useListStudents(dc: DataConnect, options?: useDataConnectQueryOptions<ListStudentsData>): UseDataConnectQueryResult<ListStudentsData, undefined>;

export function useCreateCourse(options?: useDataConnectMutationOptions<CreateCourseData, FirebaseError, CreateCourseVariables>): UseDataConnectMutationResult<CreateCourseData, CreateCourseVariables>;
export function useCreateCourse(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCourseData, FirebaseError, CreateCourseVariables>): UseDataConnectMutationResult<CreateCourseData, CreateCourseVariables>;

export function useUpdateCourse(options?: useDataConnectMutationOptions<UpdateCourseData, FirebaseError, UpdateCourseVariables>): UseDataConnectMutationResult<UpdateCourseData, UpdateCourseVariables>;
export function useUpdateCourse(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateCourseData, FirebaseError, UpdateCourseVariables>): UseDataConnectMutationResult<UpdateCourseData, UpdateCourseVariables>;

export function useDeleteCourse(options?: useDataConnectMutationOptions<DeleteCourseData, FirebaseError, DeleteCourseVariables>): UseDataConnectMutationResult<DeleteCourseData, DeleteCourseVariables>;
export function useDeleteCourse(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCourseData, FirebaseError, DeleteCourseVariables>): UseDataConnectMutationResult<DeleteCourseData, DeleteCourseVariables>;

export function useGetCourse(vars: GetCourseVariables, options?: useDataConnectQueryOptions<GetCourseData>): UseDataConnectQueryResult<GetCourseData, GetCourseVariables>;
export function useGetCourse(dc: DataConnect, vars: GetCourseVariables, options?: useDataConnectQueryOptions<GetCourseData>): UseDataConnectQueryResult<GetCourseData, GetCourseVariables>;

export function useListMyCourses(options?: useDataConnectQueryOptions<ListMyCoursesData>): UseDataConnectQueryResult<ListMyCoursesData, undefined>;
export function useListMyCourses(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyCoursesData>): UseDataConnectQueryResult<ListMyCoursesData, undefined>;

export function useCreateLecture(options?: useDataConnectMutationOptions<CreateLectureData, FirebaseError, CreateLectureVariables>): UseDataConnectMutationResult<CreateLectureData, CreateLectureVariables>;
export function useCreateLecture(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLectureData, FirebaseError, CreateLectureVariables>): UseDataConnectMutationResult<CreateLectureData, CreateLectureVariables>;

export function useUpdateLecture(options?: useDataConnectMutationOptions<UpdateLectureData, FirebaseError, UpdateLectureVariables>): UseDataConnectMutationResult<UpdateLectureData, UpdateLectureVariables>;
export function useUpdateLecture(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLectureData, FirebaseError, UpdateLectureVariables>): UseDataConnectMutationResult<UpdateLectureData, UpdateLectureVariables>;

export function useDeleteLecture(options?: useDataConnectMutationOptions<DeleteLectureData, FirebaseError, DeleteLectureVariables>): UseDataConnectMutationResult<DeleteLectureData, DeleteLectureVariables>;
export function useDeleteLecture(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteLectureData, FirebaseError, DeleteLectureVariables>): UseDataConnectMutationResult<DeleteLectureData, DeleteLectureVariables>;

export function useGetLecture(vars: GetLectureVariables, options?: useDataConnectQueryOptions<GetLectureData>): UseDataConnectQueryResult<GetLectureData, GetLectureVariables>;
export function useGetLecture(dc: DataConnect, vars: GetLectureVariables, options?: useDataConnectQueryOptions<GetLectureData>): UseDataConnectQueryResult<GetLectureData, GetLectureVariables>;

export function useListLectures(vars: ListLecturesVariables, options?: useDataConnectQueryOptions<ListLecturesData>): UseDataConnectQueryResult<ListLecturesData, ListLecturesVariables>;
export function useListLectures(dc: DataConnect, vars: ListLecturesVariables, options?: useDataConnectQueryOptions<ListLecturesData>): UseDataConnectQueryResult<ListLecturesData, ListLecturesVariables>;

export function useCreateNote(options?: useDataConnectMutationOptions<CreateNoteData, FirebaseError, CreateNoteVariables>): UseDataConnectMutationResult<CreateNoteData, CreateNoteVariables>;
export function useCreateNote(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNoteData, FirebaseError, CreateNoteVariables>): UseDataConnectMutationResult<CreateNoteData, CreateNoteVariables>;

export function useUpdateNote(options?: useDataConnectMutationOptions<UpdateNoteData, FirebaseError, UpdateNoteVariables>): UseDataConnectMutationResult<UpdateNoteData, UpdateNoteVariables>;
export function useUpdateNote(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateNoteData, FirebaseError, UpdateNoteVariables>): UseDataConnectMutationResult<UpdateNoteData, UpdateNoteVariables>;

export function useDeleteNote(options?: useDataConnectMutationOptions<DeleteNoteData, FirebaseError, DeleteNoteVariables>): UseDataConnectMutationResult<DeleteNoteData, DeleteNoteVariables>;
export function useDeleteNote(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteNoteData, FirebaseError, DeleteNoteVariables>): UseDataConnectMutationResult<DeleteNoteData, DeleteNoteVariables>;

export function useGetNote(vars: GetNoteVariables, options?: useDataConnectQueryOptions<GetNoteData>): UseDataConnectQueryResult<GetNoteData, GetNoteVariables>;
export function useGetNote(dc: DataConnect, vars: GetNoteVariables, options?: useDataConnectQueryOptions<GetNoteData>): UseDataConnectQueryResult<GetNoteData, GetNoteVariables>;

export function useListNotes(vars: ListNotesVariables, options?: useDataConnectQueryOptions<ListNotesData>): UseDataConnectQueryResult<ListNotesData, ListNotesVariables>;
export function useListNotes(dc: DataConnect, vars: ListNotesVariables, options?: useDataConnectQueryOptions<ListNotesData>): UseDataConnectQueryResult<ListNotesData, ListNotesVariables>;

export function useCreateFlashcard(options?: useDataConnectMutationOptions<CreateFlashcardData, FirebaseError, CreateFlashcardVariables>): UseDataConnectMutationResult<CreateFlashcardData, CreateFlashcardVariables>;
export function useCreateFlashcard(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFlashcardData, FirebaseError, CreateFlashcardVariables>): UseDataConnectMutationResult<CreateFlashcardData, CreateFlashcardVariables>;

export function useUpdateFlashcard(options?: useDataConnectMutationOptions<UpdateFlashcardData, FirebaseError, UpdateFlashcardVariables>): UseDataConnectMutationResult<UpdateFlashcardData, UpdateFlashcardVariables>;
export function useUpdateFlashcard(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateFlashcardData, FirebaseError, UpdateFlashcardVariables>): UseDataConnectMutationResult<UpdateFlashcardData, UpdateFlashcardVariables>;

export function useDeleteFlashcard(options?: useDataConnectMutationOptions<DeleteFlashcardData, FirebaseError, DeleteFlashcardVariables>): UseDataConnectMutationResult<DeleteFlashcardData, DeleteFlashcardVariables>;
export function useDeleteFlashcard(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteFlashcardData, FirebaseError, DeleteFlashcardVariables>): UseDataConnectMutationResult<DeleteFlashcardData, DeleteFlashcardVariables>;

export function useGetFlashcard(vars: GetFlashcardVariables, options?: useDataConnectQueryOptions<GetFlashcardData>): UseDataConnectQueryResult<GetFlashcardData, GetFlashcardVariables>;
export function useGetFlashcard(dc: DataConnect, vars: GetFlashcardVariables, options?: useDataConnectQueryOptions<GetFlashcardData>): UseDataConnectQueryResult<GetFlashcardData, GetFlashcardVariables>;

export function useListFlashcards(vars: ListFlashcardsVariables, options?: useDataConnectQueryOptions<ListFlashcardsData>): UseDataConnectQueryResult<ListFlashcardsData, ListFlashcardsVariables>;
export function useListFlashcards(dc: DataConnect, vars: ListFlashcardsVariables, options?: useDataConnectQueryOptions<ListFlashcardsData>): UseDataConnectQueryResult<ListFlashcardsData, ListFlashcardsVariables>;

export function useCreateReminder(options?: useDataConnectMutationOptions<CreateReminderData, FirebaseError, CreateReminderVariables>): UseDataConnectMutationResult<CreateReminderData, CreateReminderVariables>;
export function useCreateReminder(dc: DataConnect, options?: useDataConnectMutationOptions<CreateReminderData, FirebaseError, CreateReminderVariables>): UseDataConnectMutationResult<CreateReminderData, CreateReminderVariables>;

export function useUpdateReminder(options?: useDataConnectMutationOptions<UpdateReminderData, FirebaseError, UpdateReminderVariables>): UseDataConnectMutationResult<UpdateReminderData, UpdateReminderVariables>;
export function useUpdateReminder(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateReminderData, FirebaseError, UpdateReminderVariables>): UseDataConnectMutationResult<UpdateReminderData, UpdateReminderVariables>;

export function useDeleteReminder(options?: useDataConnectMutationOptions<DeleteReminderData, FirebaseError, DeleteReminderVariables>): UseDataConnectMutationResult<DeleteReminderData, DeleteReminderVariables>;
export function useDeleteReminder(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteReminderData, FirebaseError, DeleteReminderVariables>): UseDataConnectMutationResult<DeleteReminderData, DeleteReminderVariables>;

export function useGetReminder(vars: GetReminderVariables, options?: useDataConnectQueryOptions<GetReminderData>): UseDataConnectQueryResult<GetReminderData, GetReminderVariables>;
export function useGetReminder(dc: DataConnect, vars: GetReminderVariables, options?: useDataConnectQueryOptions<GetReminderData>): UseDataConnectQueryResult<GetReminderData, GetReminderVariables>;

export function useListMyReminders(options?: useDataConnectQueryOptions<ListMyRemindersData>): UseDataConnectQueryResult<ListMyRemindersData, undefined>;
export function useListMyReminders(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyRemindersData>): UseDataConnectQueryResult<ListMyRemindersData, undefined>;
