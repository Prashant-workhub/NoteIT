# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetMyStudent*](#getmystudent)
  - [*ListStudents*](#liststudents)
  - [*GetCourse*](#getcourse)
  - [*ListMyCourses*](#listmycourses)
  - [*GetLecture*](#getlecture)
  - [*ListLectures*](#listlectures)
  - [*GetNote*](#getnote)
  - [*ListNotes*](#listnotes)
  - [*GetFlashcard*](#getflashcard)
  - [*ListFlashcards*](#listflashcards)
  - [*GetReminder*](#getreminder)
  - [*ListMyReminders*](#listmyreminders)
- [**Mutations**](#mutations)
  - [*CreateStudent*](#createstudent)
  - [*UpdateStudent*](#updatestudent)
  - [*DeleteStudent*](#deletestudent)
  - [*CreateCourse*](#createcourse)
  - [*UpdateCourse*](#updatecourse)
  - [*DeleteCourse*](#deletecourse)
  - [*CreateLecture*](#createlecture)
  - [*UpdateLecture*](#updatelecture)
  - [*DeleteLecture*](#deletelecture)
  - [*CreateNote*](#createnote)
  - [*UpdateNote*](#updatenote)
  - [*DeleteNote*](#deletenote)
  - [*CreateFlashcard*](#createflashcard)
  - [*UpdateFlashcard*](#updateflashcard)
  - [*DeleteFlashcard*](#deleteflashcard)
  - [*CreateReminder*](#createreminder)
  - [*UpdateReminder*](#updatereminder)
  - [*DeleteReminder*](#deletereminder)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetMyStudent
You can execute the `GetMyStudent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyStudent(options?: ExecuteQueryOptions): QueryPromise<GetMyStudentData, undefined>;

interface GetMyStudentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyStudentData, undefined>;
}
export const getMyStudentRef: GetMyStudentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyStudent(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyStudentData, undefined>;

interface GetMyStudentRef {
  ...
  (dc: DataConnect): QueryRef<GetMyStudentData, undefined>;
}
export const getMyStudentRef: GetMyStudentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyStudentRef:
```typescript
const name = getMyStudentRef.operationName;
console.log(name);
```

### Variables
The `GetMyStudent` query has no variables.
### Return Type
Recall that executing the `GetMyStudent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyStudentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyStudentData {
  student?: {
    name: string;
    email: string;
  };
}
```
### Using `GetMyStudent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyStudent } from '@dataconnect/generated';


// Call the `getMyStudent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyStudent();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyStudent(dataConnect);

console.log(data.student);

// Or, you can use the `Promise` API.
getMyStudent().then((response) => {
  const data = response.data;
  console.log(data.student);
});
```

### Using `GetMyStudent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyStudentRef } from '@dataconnect/generated';


// Call the `getMyStudentRef()` function to get a reference to the query.
const ref = getMyStudentRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyStudentRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.student);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.student);
});
```

## ListStudents
You can execute the `ListStudents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listStudents(options?: ExecuteQueryOptions): QueryPromise<ListStudentsData, undefined>;

interface ListStudentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListStudentsData, undefined>;
}
export const listStudentsRef: ListStudentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listStudents(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListStudentsData, undefined>;

interface ListStudentsRef {
  ...
  (dc: DataConnect): QueryRef<ListStudentsData, undefined>;
}
export const listStudentsRef: ListStudentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listStudentsRef:
```typescript
const name = listStudentsRef.operationName;
console.log(name);
```

### Variables
The `ListStudents` query has no variables.
### Return Type
Recall that executing the `ListStudents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListStudentsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListStudentsData {
  students: ({
    name: string;
    universityName?: string | null;
  })[];
}
```
### Using `ListStudents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listStudents } from '@dataconnect/generated';


// Call the `listStudents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listStudents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listStudents(dataConnect);

console.log(data.students);

// Or, you can use the `Promise` API.
listStudents().then((response) => {
  const data = response.data;
  console.log(data.students);
});
```

### Using `ListStudents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listStudentsRef } from '@dataconnect/generated';


// Call the `listStudentsRef()` function to get a reference to the query.
const ref = listStudentsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listStudentsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.students);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.students);
});
```

## GetCourse
You can execute the `GetCourse` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCourse(vars: GetCourseVariables, options?: ExecuteQueryOptions): QueryPromise<GetCourseData, GetCourseVariables>;

interface GetCourseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCourseVariables): QueryRef<GetCourseData, GetCourseVariables>;
}
export const getCourseRef: GetCourseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCourse(dc: DataConnect, vars: GetCourseVariables, options?: ExecuteQueryOptions): QueryPromise<GetCourseData, GetCourseVariables>;

interface GetCourseRef {
  ...
  (dc: DataConnect, vars: GetCourseVariables): QueryRef<GetCourseData, GetCourseVariables>;
}
export const getCourseRef: GetCourseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCourseRef:
```typescript
const name = getCourseRef.operationName;
console.log(name);
```

### Variables
The `GetCourse` query requires an argument of type `GetCourseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCourseVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetCourse` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCourseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCourseData {
  course?: {
    title: string;
    code: string;
  };
}
```
### Using `GetCourse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCourse, GetCourseVariables } from '@dataconnect/generated';

// The `GetCourse` query requires an argument of type `GetCourseVariables`:
const getCourseVars: GetCourseVariables = {
  id: ..., 
};

// Call the `getCourse()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCourse(getCourseVars);
// Variables can be defined inline as well.
const { data } = await getCourse({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCourse(dataConnect, getCourseVars);

console.log(data.course);

// Or, you can use the `Promise` API.
getCourse(getCourseVars).then((response) => {
  const data = response.data;
  console.log(data.course);
});
```

### Using `GetCourse`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCourseRef, GetCourseVariables } from '@dataconnect/generated';

// The `GetCourse` query requires an argument of type `GetCourseVariables`:
const getCourseVars: GetCourseVariables = {
  id: ..., 
};

// Call the `getCourseRef()` function to get a reference to the query.
const ref = getCourseRef(getCourseVars);
// Variables can be defined inline as well.
const ref = getCourseRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCourseRef(dataConnect, getCourseVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.course);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.course);
});
```

## ListMyCourses
You can execute the `ListMyCourses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyCourses(options?: ExecuteQueryOptions): QueryPromise<ListMyCoursesData, undefined>;

interface ListMyCoursesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyCoursesData, undefined>;
}
export const listMyCoursesRef: ListMyCoursesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyCourses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyCoursesData, undefined>;

interface ListMyCoursesRef {
  ...
  (dc: DataConnect): QueryRef<ListMyCoursesData, undefined>;
}
export const listMyCoursesRef: ListMyCoursesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyCoursesRef:
```typescript
const name = listMyCoursesRef.operationName;
console.log(name);
```

### Variables
The `ListMyCourses` query has no variables.
### Return Type
Recall that executing the `ListMyCourses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyCoursesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyCoursesData {
  courses: ({
    title: string;
    code: string;
  })[];
}
```
### Using `ListMyCourses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyCourses } from '@dataconnect/generated';


// Call the `listMyCourses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyCourses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyCourses(dataConnect);

console.log(data.courses);

// Or, you can use the `Promise` API.
listMyCourses().then((response) => {
  const data = response.data;
  console.log(data.courses);
});
```

### Using `ListMyCourses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyCoursesRef } from '@dataconnect/generated';


// Call the `listMyCoursesRef()` function to get a reference to the query.
const ref = listMyCoursesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyCoursesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.courses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.courses);
});
```

## GetLecture
You can execute the `GetLecture` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLecture(vars: GetLectureVariables, options?: ExecuteQueryOptions): QueryPromise<GetLectureData, GetLectureVariables>;

interface GetLectureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLectureVariables): QueryRef<GetLectureData, GetLectureVariables>;
}
export const getLectureRef: GetLectureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLecture(dc: DataConnect, vars: GetLectureVariables, options?: ExecuteQueryOptions): QueryPromise<GetLectureData, GetLectureVariables>;

interface GetLectureRef {
  ...
  (dc: DataConnect, vars: GetLectureVariables): QueryRef<GetLectureData, GetLectureVariables>;
}
export const getLectureRef: GetLectureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLectureRef:
```typescript
const name = getLectureRef.operationName;
console.log(name);
```

### Variables
The `GetLecture` query requires an argument of type `GetLectureVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLectureVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetLecture` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLectureData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLectureData {
  lecture?: {
    topic: string;
    date: DateString;
  };
}
```
### Using `GetLecture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLecture, GetLectureVariables } from '@dataconnect/generated';

// The `GetLecture` query requires an argument of type `GetLectureVariables`:
const getLectureVars: GetLectureVariables = {
  id: ..., 
};

// Call the `getLecture()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLecture(getLectureVars);
// Variables can be defined inline as well.
const { data } = await getLecture({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLecture(dataConnect, getLectureVars);

console.log(data.lecture);

// Or, you can use the `Promise` API.
getLecture(getLectureVars).then((response) => {
  const data = response.data;
  console.log(data.lecture);
});
```

### Using `GetLecture`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLectureRef, GetLectureVariables } from '@dataconnect/generated';

// The `GetLecture` query requires an argument of type `GetLectureVariables`:
const getLectureVars: GetLectureVariables = {
  id: ..., 
};

// Call the `getLectureRef()` function to get a reference to the query.
const ref = getLectureRef(getLectureVars);
// Variables can be defined inline as well.
const ref = getLectureRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLectureRef(dataConnect, getLectureVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lecture);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lecture);
});
```

## ListLectures
You can execute the `ListLectures` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listLectures(vars: ListLecturesVariables, options?: ExecuteQueryOptions): QueryPromise<ListLecturesData, ListLecturesVariables>;

interface ListLecturesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListLecturesVariables): QueryRef<ListLecturesData, ListLecturesVariables>;
}
export const listLecturesRef: ListLecturesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listLectures(dc: DataConnect, vars: ListLecturesVariables, options?: ExecuteQueryOptions): QueryPromise<ListLecturesData, ListLecturesVariables>;

interface ListLecturesRef {
  ...
  (dc: DataConnect, vars: ListLecturesVariables): QueryRef<ListLecturesData, ListLecturesVariables>;
}
export const listLecturesRef: ListLecturesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listLecturesRef:
```typescript
const name = listLecturesRef.operationName;
console.log(name);
```

### Variables
The `ListLectures` query requires an argument of type `ListLecturesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListLecturesVariables {
  courseId: UUIDString;
}
```
### Return Type
Recall that executing the `ListLectures` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListLecturesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListLecturesData {
  lectures: ({
    topic: string;
    date: DateString;
  })[];
}
```
### Using `ListLectures`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listLectures, ListLecturesVariables } from '@dataconnect/generated';

// The `ListLectures` query requires an argument of type `ListLecturesVariables`:
const listLecturesVars: ListLecturesVariables = {
  courseId: ..., 
};

// Call the `listLectures()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listLectures(listLecturesVars);
// Variables can be defined inline as well.
const { data } = await listLectures({ courseId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listLectures(dataConnect, listLecturesVars);

console.log(data.lectures);

// Or, you can use the `Promise` API.
listLectures(listLecturesVars).then((response) => {
  const data = response.data;
  console.log(data.lectures);
});
```

### Using `ListLectures`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listLecturesRef, ListLecturesVariables } from '@dataconnect/generated';

// The `ListLectures` query requires an argument of type `ListLecturesVariables`:
const listLecturesVars: ListLecturesVariables = {
  courseId: ..., 
};

// Call the `listLecturesRef()` function to get a reference to the query.
const ref = listLecturesRef(listLecturesVars);
// Variables can be defined inline as well.
const ref = listLecturesRef({ courseId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listLecturesRef(dataConnect, listLecturesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lectures);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lectures);
});
```

## GetNote
You can execute the `GetNote` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getNote(vars: GetNoteVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoteData, GetNoteVariables>;

interface GetNoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNoteVariables): QueryRef<GetNoteData, GetNoteVariables>;
}
export const getNoteRef: GetNoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getNote(dc: DataConnect, vars: GetNoteVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoteData, GetNoteVariables>;

interface GetNoteRef {
  ...
  (dc: DataConnect, vars: GetNoteVariables): QueryRef<GetNoteData, GetNoteVariables>;
}
export const getNoteRef: GetNoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getNoteRef:
```typescript
const name = getNoteRef.operationName;
console.log(name);
```

### Variables
The `GetNote` query requires an argument of type `GetNoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetNoteVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetNote` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetNoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetNoteData {
  note?: {
    rawContent: string;
    summaryContent: string;
  };
}
```
### Using `GetNote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getNote, GetNoteVariables } from '@dataconnect/generated';

// The `GetNote` query requires an argument of type `GetNoteVariables`:
const getNoteVars: GetNoteVariables = {
  id: ..., 
};

// Call the `getNote()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getNote(getNoteVars);
// Variables can be defined inline as well.
const { data } = await getNote({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getNote(dataConnect, getNoteVars);

console.log(data.note);

// Or, you can use the `Promise` API.
getNote(getNoteVars).then((response) => {
  const data = response.data;
  console.log(data.note);
});
```

### Using `GetNote`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getNoteRef, GetNoteVariables } from '@dataconnect/generated';

// The `GetNote` query requires an argument of type `GetNoteVariables`:
const getNoteVars: GetNoteVariables = {
  id: ..., 
};

// Call the `getNoteRef()` function to get a reference to the query.
const ref = getNoteRef(getNoteVars);
// Variables can be defined inline as well.
const ref = getNoteRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getNoteRef(dataConnect, getNoteVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.note);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.note);
});
```

## ListNotes
You can execute the `ListNotes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listNotes(vars: ListNotesVariables, options?: ExecuteQueryOptions): QueryPromise<ListNotesData, ListNotesVariables>;

interface ListNotesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListNotesVariables): QueryRef<ListNotesData, ListNotesVariables>;
}
export const listNotesRef: ListNotesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listNotes(dc: DataConnect, vars: ListNotesVariables, options?: ExecuteQueryOptions): QueryPromise<ListNotesData, ListNotesVariables>;

interface ListNotesRef {
  ...
  (dc: DataConnect, vars: ListNotesVariables): QueryRef<ListNotesData, ListNotesVariables>;
}
export const listNotesRef: ListNotesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listNotesRef:
```typescript
const name = listNotesRef.operationName;
console.log(name);
```

### Variables
The `ListNotes` query requires an argument of type `ListNotesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListNotesVariables {
  lectureId: UUIDString;
}
```
### Return Type
Recall that executing the `ListNotes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListNotesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListNotesData {
  notes: ({
    summaryContent: string;
  })[];
}
```
### Using `ListNotes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listNotes, ListNotesVariables } from '@dataconnect/generated';

// The `ListNotes` query requires an argument of type `ListNotesVariables`:
const listNotesVars: ListNotesVariables = {
  lectureId: ..., 
};

// Call the `listNotes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listNotes(listNotesVars);
// Variables can be defined inline as well.
const { data } = await listNotes({ lectureId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listNotes(dataConnect, listNotesVars);

console.log(data.notes);

// Or, you can use the `Promise` API.
listNotes(listNotesVars).then((response) => {
  const data = response.data;
  console.log(data.notes);
});
```

### Using `ListNotes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listNotesRef, ListNotesVariables } from '@dataconnect/generated';

// The `ListNotes` query requires an argument of type `ListNotesVariables`:
const listNotesVars: ListNotesVariables = {
  lectureId: ..., 
};

// Call the `listNotesRef()` function to get a reference to the query.
const ref = listNotesRef(listNotesVars);
// Variables can be defined inline as well.
const ref = listNotesRef({ lectureId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listNotesRef(dataConnect, listNotesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.notes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.notes);
});
```

## GetFlashcard
You can execute the `GetFlashcard` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFlashcard(vars: GetFlashcardVariables, options?: ExecuteQueryOptions): QueryPromise<GetFlashcardData, GetFlashcardVariables>;

interface GetFlashcardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFlashcardVariables): QueryRef<GetFlashcardData, GetFlashcardVariables>;
}
export const getFlashcardRef: GetFlashcardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFlashcard(dc: DataConnect, vars: GetFlashcardVariables, options?: ExecuteQueryOptions): QueryPromise<GetFlashcardData, GetFlashcardVariables>;

interface GetFlashcardRef {
  ...
  (dc: DataConnect, vars: GetFlashcardVariables): QueryRef<GetFlashcardData, GetFlashcardVariables>;
}
export const getFlashcardRef: GetFlashcardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFlashcardRef:
```typescript
const name = getFlashcardRef.operationName;
console.log(name);
```

### Variables
The `GetFlashcard` query requires an argument of type `GetFlashcardVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFlashcardVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetFlashcard` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFlashcardData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFlashcardData {
  flashcard?: {
    question: string;
    answer: string;
  };
}
```
### Using `GetFlashcard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFlashcard, GetFlashcardVariables } from '@dataconnect/generated';

// The `GetFlashcard` query requires an argument of type `GetFlashcardVariables`:
const getFlashcardVars: GetFlashcardVariables = {
  id: ..., 
};

// Call the `getFlashcard()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFlashcard(getFlashcardVars);
// Variables can be defined inline as well.
const { data } = await getFlashcard({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFlashcard(dataConnect, getFlashcardVars);

console.log(data.flashcard);

// Or, you can use the `Promise` API.
getFlashcard(getFlashcardVars).then((response) => {
  const data = response.data;
  console.log(data.flashcard);
});
```

### Using `GetFlashcard`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFlashcardRef, GetFlashcardVariables } from '@dataconnect/generated';

// The `GetFlashcard` query requires an argument of type `GetFlashcardVariables`:
const getFlashcardVars: GetFlashcardVariables = {
  id: ..., 
};

// Call the `getFlashcardRef()` function to get a reference to the query.
const ref = getFlashcardRef(getFlashcardVars);
// Variables can be defined inline as well.
const ref = getFlashcardRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFlashcardRef(dataConnect, getFlashcardVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.flashcard);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.flashcard);
});
```

## ListFlashcards
You can execute the `ListFlashcards` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listFlashcards(vars: ListFlashcardsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFlashcardsData, ListFlashcardsVariables>;

interface ListFlashcardsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListFlashcardsVariables): QueryRef<ListFlashcardsData, ListFlashcardsVariables>;
}
export const listFlashcardsRef: ListFlashcardsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listFlashcards(dc: DataConnect, vars: ListFlashcardsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFlashcardsData, ListFlashcardsVariables>;

interface ListFlashcardsRef {
  ...
  (dc: DataConnect, vars: ListFlashcardsVariables): QueryRef<ListFlashcardsData, ListFlashcardsVariables>;
}
export const listFlashcardsRef: ListFlashcardsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listFlashcardsRef:
```typescript
const name = listFlashcardsRef.operationName;
console.log(name);
```

### Variables
The `ListFlashcards` query requires an argument of type `ListFlashcardsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListFlashcardsVariables {
  noteId: UUIDString;
}
```
### Return Type
Recall that executing the `ListFlashcards` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListFlashcardsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListFlashcardsData {
  flashcards: ({
    question: string;
    answer: string;
  })[];
}
```
### Using `ListFlashcards`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listFlashcards, ListFlashcardsVariables } from '@dataconnect/generated';

// The `ListFlashcards` query requires an argument of type `ListFlashcardsVariables`:
const listFlashcardsVars: ListFlashcardsVariables = {
  noteId: ..., 
};

// Call the `listFlashcards()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listFlashcards(listFlashcardsVars);
// Variables can be defined inline as well.
const { data } = await listFlashcards({ noteId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listFlashcards(dataConnect, listFlashcardsVars);

console.log(data.flashcards);

// Or, you can use the `Promise` API.
listFlashcards(listFlashcardsVars).then((response) => {
  const data = response.data;
  console.log(data.flashcards);
});
```

### Using `ListFlashcards`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listFlashcardsRef, ListFlashcardsVariables } from '@dataconnect/generated';

// The `ListFlashcards` query requires an argument of type `ListFlashcardsVariables`:
const listFlashcardsVars: ListFlashcardsVariables = {
  noteId: ..., 
};

// Call the `listFlashcardsRef()` function to get a reference to the query.
const ref = listFlashcardsRef(listFlashcardsVars);
// Variables can be defined inline as well.
const ref = listFlashcardsRef({ noteId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listFlashcardsRef(dataConnect, listFlashcardsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.flashcards);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.flashcards);
});
```

## GetReminder
You can execute the `GetReminder` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getReminder(vars: GetReminderVariables, options?: ExecuteQueryOptions): QueryPromise<GetReminderData, GetReminderVariables>;

interface GetReminderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetReminderVariables): QueryRef<GetReminderData, GetReminderVariables>;
}
export const getReminderRef: GetReminderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getReminder(dc: DataConnect, vars: GetReminderVariables, options?: ExecuteQueryOptions): QueryPromise<GetReminderData, GetReminderVariables>;

interface GetReminderRef {
  ...
  (dc: DataConnect, vars: GetReminderVariables): QueryRef<GetReminderData, GetReminderVariables>;
}
export const getReminderRef: GetReminderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getReminderRef:
```typescript
const name = getReminderRef.operationName;
console.log(name);
```

### Variables
The `GetReminder` query requires an argument of type `GetReminderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetReminderVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetReminder` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetReminderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetReminderData {
  reminder?: {
    title: string;
    dueDate: TimestampString;
  };
}
```
### Using `GetReminder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getReminder, GetReminderVariables } from '@dataconnect/generated';

// The `GetReminder` query requires an argument of type `GetReminderVariables`:
const getReminderVars: GetReminderVariables = {
  id: ..., 
};

// Call the `getReminder()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getReminder(getReminderVars);
// Variables can be defined inline as well.
const { data } = await getReminder({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getReminder(dataConnect, getReminderVars);

console.log(data.reminder);

// Or, you can use the `Promise` API.
getReminder(getReminderVars).then((response) => {
  const data = response.data;
  console.log(data.reminder);
});
```

### Using `GetReminder`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getReminderRef, GetReminderVariables } from '@dataconnect/generated';

// The `GetReminder` query requires an argument of type `GetReminderVariables`:
const getReminderVars: GetReminderVariables = {
  id: ..., 
};

// Call the `getReminderRef()` function to get a reference to the query.
const ref = getReminderRef(getReminderVars);
// Variables can be defined inline as well.
const ref = getReminderRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getReminderRef(dataConnect, getReminderVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.reminder);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.reminder);
});
```

## ListMyReminders
You can execute the `ListMyReminders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyReminders(options?: ExecuteQueryOptions): QueryPromise<ListMyRemindersData, undefined>;

interface ListMyRemindersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyRemindersData, undefined>;
}
export const listMyRemindersRef: ListMyRemindersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyReminders(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyRemindersData, undefined>;

interface ListMyRemindersRef {
  ...
  (dc: DataConnect): QueryRef<ListMyRemindersData, undefined>;
}
export const listMyRemindersRef: ListMyRemindersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyRemindersRef:
```typescript
const name = listMyRemindersRef.operationName;
console.log(name);
```

### Variables
The `ListMyReminders` query has no variables.
### Return Type
Recall that executing the `ListMyReminders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyRemindersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyRemindersData {
  reminders: ({
    title: string;
    dueDate: TimestampString;
  })[];
}
```
### Using `ListMyReminders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyReminders } from '@dataconnect/generated';


// Call the `listMyReminders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyReminders();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyReminders(dataConnect);

console.log(data.reminders);

// Or, you can use the `Promise` API.
listMyReminders().then((response) => {
  const data = response.data;
  console.log(data.reminders);
});
```

### Using `ListMyReminders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyRemindersRef } from '@dataconnect/generated';


// Call the `listMyRemindersRef()` function to get a reference to the query.
const ref = listMyRemindersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyRemindersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.reminders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.reminders);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateStudent
You can execute the `CreateStudent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createStudent(): MutationPromise<CreateStudentData, undefined>;

interface CreateStudentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateStudentData, undefined>;
}
export const createStudentRef: CreateStudentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createStudent(dc: DataConnect): MutationPromise<CreateStudentData, undefined>;

interface CreateStudentRef {
  ...
  (dc: DataConnect): MutationRef<CreateStudentData, undefined>;
}
export const createStudentRef: CreateStudentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createStudentRef:
```typescript
const name = createStudentRef.operationName;
console.log(name);
```

### Variables
The `CreateStudent` mutation has no variables.
### Return Type
Recall that executing the `CreateStudent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateStudentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateStudentData {
  student_insert: Student_Key;
}
```
### Using `CreateStudent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createStudent } from '@dataconnect/generated';


// Call the `createStudent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createStudent();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createStudent(dataConnect);

console.log(data.student_insert);

// Or, you can use the `Promise` API.
createStudent().then((response) => {
  const data = response.data;
  console.log(data.student_insert);
});
```

### Using `CreateStudent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createStudentRef } from '@dataconnect/generated';


// Call the `createStudentRef()` function to get a reference to the mutation.
const ref = createStudentRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createStudentRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.student_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.student_insert);
});
```

## UpdateStudent
You can execute the `UpdateStudent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateStudent(vars?: UpdateStudentVariables): MutationPromise<UpdateStudentData, UpdateStudentVariables>;

interface UpdateStudentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpdateStudentVariables): MutationRef<UpdateStudentData, UpdateStudentVariables>;
}
export const updateStudentRef: UpdateStudentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateStudent(dc: DataConnect, vars?: UpdateStudentVariables): MutationPromise<UpdateStudentData, UpdateStudentVariables>;

interface UpdateStudentRef {
  ...
  (dc: DataConnect, vars?: UpdateStudentVariables): MutationRef<UpdateStudentData, UpdateStudentVariables>;
}
export const updateStudentRef: UpdateStudentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateStudentRef:
```typescript
const name = updateStudentRef.operationName;
console.log(name);
```

### Variables
The `UpdateStudent` mutation has an optional argument of type `UpdateStudentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateStudentVariables {
  name?: string | null;
}
```
### Return Type
Recall that executing the `UpdateStudent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateStudentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateStudentData {
  student_update?: Student_Key | null;
}
```
### Using `UpdateStudent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateStudent, UpdateStudentVariables } from '@dataconnect/generated';

// The `UpdateStudent` mutation has an optional argument of type `UpdateStudentVariables`:
const updateStudentVars: UpdateStudentVariables = {
  name: ..., // optional
};

// Call the `updateStudent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateStudent(updateStudentVars);
// Variables can be defined inline as well.
const { data } = await updateStudent({ name: ..., });
// Since all variables are optional for this mutation, you can omit the `UpdateStudentVariables` argument.
const { data } = await updateStudent();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateStudent(dataConnect, updateStudentVars);

console.log(data.student_update);

// Or, you can use the `Promise` API.
updateStudent(updateStudentVars).then((response) => {
  const data = response.data;
  console.log(data.student_update);
});
```

### Using `UpdateStudent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateStudentRef, UpdateStudentVariables } from '@dataconnect/generated';

// The `UpdateStudent` mutation has an optional argument of type `UpdateStudentVariables`:
const updateStudentVars: UpdateStudentVariables = {
  name: ..., // optional
};

// Call the `updateStudentRef()` function to get a reference to the mutation.
const ref = updateStudentRef(updateStudentVars);
// Variables can be defined inline as well.
const ref = updateStudentRef({ name: ..., });
// Since all variables are optional for this mutation, you can omit the `UpdateStudentVariables` argument.
const ref = updateStudentRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateStudentRef(dataConnect, updateStudentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.student_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.student_update);
});
```

## DeleteStudent
You can execute the `DeleteStudent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteStudent(): MutationPromise<DeleteStudentData, undefined>;

interface DeleteStudentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteStudentData, undefined>;
}
export const deleteStudentRef: DeleteStudentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteStudent(dc: DataConnect): MutationPromise<DeleteStudentData, undefined>;

interface DeleteStudentRef {
  ...
  (dc: DataConnect): MutationRef<DeleteStudentData, undefined>;
}
export const deleteStudentRef: DeleteStudentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteStudentRef:
```typescript
const name = deleteStudentRef.operationName;
console.log(name);
```

### Variables
The `DeleteStudent` mutation has no variables.
### Return Type
Recall that executing the `DeleteStudent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteStudentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteStudentData {
  student_delete?: Student_Key | null;
}
```
### Using `DeleteStudent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteStudent } from '@dataconnect/generated';


// Call the `deleteStudent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteStudent();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteStudent(dataConnect);

console.log(data.student_delete);

// Or, you can use the `Promise` API.
deleteStudent().then((response) => {
  const data = response.data;
  console.log(data.student_delete);
});
```

### Using `DeleteStudent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteStudentRef } from '@dataconnect/generated';


// Call the `deleteStudentRef()` function to get a reference to the mutation.
const ref = deleteStudentRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteStudentRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.student_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.student_delete);
});
```

## CreateCourse
You can execute the `CreateCourse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCourse(vars: CreateCourseVariables): MutationPromise<CreateCourseData, CreateCourseVariables>;

interface CreateCourseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCourseVariables): MutationRef<CreateCourseData, CreateCourseVariables>;
}
export const createCourseRef: CreateCourseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCourse(dc: DataConnect, vars: CreateCourseVariables): MutationPromise<CreateCourseData, CreateCourseVariables>;

interface CreateCourseRef {
  ...
  (dc: DataConnect, vars: CreateCourseVariables): MutationRef<CreateCourseData, CreateCourseVariables>;
}
export const createCourseRef: CreateCourseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCourseRef:
```typescript
const name = createCourseRef.operationName;
console.log(name);
```

### Variables
The `CreateCourse` mutation requires an argument of type `CreateCourseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCourseVariables {
  title: string;
  code: string;
}
```
### Return Type
Recall that executing the `CreateCourse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCourseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCourseData {
  course_insert: Course_Key;
}
```
### Using `CreateCourse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCourse, CreateCourseVariables } from '@dataconnect/generated';

// The `CreateCourse` mutation requires an argument of type `CreateCourseVariables`:
const createCourseVars: CreateCourseVariables = {
  title: ..., 
  code: ..., 
};

// Call the `createCourse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCourse(createCourseVars);
// Variables can be defined inline as well.
const { data } = await createCourse({ title: ..., code: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCourse(dataConnect, createCourseVars);

console.log(data.course_insert);

// Or, you can use the `Promise` API.
createCourse(createCourseVars).then((response) => {
  const data = response.data;
  console.log(data.course_insert);
});
```

### Using `CreateCourse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCourseRef, CreateCourseVariables } from '@dataconnect/generated';

// The `CreateCourse` mutation requires an argument of type `CreateCourseVariables`:
const createCourseVars: CreateCourseVariables = {
  title: ..., 
  code: ..., 
};

// Call the `createCourseRef()` function to get a reference to the mutation.
const ref = createCourseRef(createCourseVars);
// Variables can be defined inline as well.
const ref = createCourseRef({ title: ..., code: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCourseRef(dataConnect, createCourseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.course_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.course_insert);
});
```

## UpdateCourse
You can execute the `UpdateCourse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateCourse(vars: UpdateCourseVariables): MutationPromise<UpdateCourseData, UpdateCourseVariables>;

interface UpdateCourseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCourseVariables): MutationRef<UpdateCourseData, UpdateCourseVariables>;
}
export const updateCourseRef: UpdateCourseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCourse(dc: DataConnect, vars: UpdateCourseVariables): MutationPromise<UpdateCourseData, UpdateCourseVariables>;

interface UpdateCourseRef {
  ...
  (dc: DataConnect, vars: UpdateCourseVariables): MutationRef<UpdateCourseData, UpdateCourseVariables>;
}
export const updateCourseRef: UpdateCourseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCourseRef:
```typescript
const name = updateCourseRef.operationName;
console.log(name);
```

### Variables
The `UpdateCourse` mutation requires an argument of type `UpdateCourseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCourseVariables {
  id: UUIDString;
  title?: string | null;
}
```
### Return Type
Recall that executing the `UpdateCourse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCourseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCourseData {
  course_update?: Course_Key | null;
}
```
### Using `UpdateCourse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCourse, UpdateCourseVariables } from '@dataconnect/generated';

// The `UpdateCourse` mutation requires an argument of type `UpdateCourseVariables`:
const updateCourseVars: UpdateCourseVariables = {
  id: ..., 
  title: ..., // optional
};

// Call the `updateCourse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCourse(updateCourseVars);
// Variables can be defined inline as well.
const { data } = await updateCourse({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCourse(dataConnect, updateCourseVars);

console.log(data.course_update);

// Or, you can use the `Promise` API.
updateCourse(updateCourseVars).then((response) => {
  const data = response.data;
  console.log(data.course_update);
});
```

### Using `UpdateCourse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCourseRef, UpdateCourseVariables } from '@dataconnect/generated';

// The `UpdateCourse` mutation requires an argument of type `UpdateCourseVariables`:
const updateCourseVars: UpdateCourseVariables = {
  id: ..., 
  title: ..., // optional
};

// Call the `updateCourseRef()` function to get a reference to the mutation.
const ref = updateCourseRef(updateCourseVars);
// Variables can be defined inline as well.
const ref = updateCourseRef({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCourseRef(dataConnect, updateCourseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.course_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.course_update);
});
```

## DeleteCourse
You can execute the `DeleteCourse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteCourse(vars: DeleteCourseVariables): MutationPromise<DeleteCourseData, DeleteCourseVariables>;

interface DeleteCourseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCourseVariables): MutationRef<DeleteCourseData, DeleteCourseVariables>;
}
export const deleteCourseRef: DeleteCourseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCourse(dc: DataConnect, vars: DeleteCourseVariables): MutationPromise<DeleteCourseData, DeleteCourseVariables>;

interface DeleteCourseRef {
  ...
  (dc: DataConnect, vars: DeleteCourseVariables): MutationRef<DeleteCourseData, DeleteCourseVariables>;
}
export const deleteCourseRef: DeleteCourseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCourseRef:
```typescript
const name = deleteCourseRef.operationName;
console.log(name);
```

### Variables
The `DeleteCourse` mutation requires an argument of type `DeleteCourseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCourseVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteCourse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCourseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCourseData {
  course_delete?: Course_Key | null;
}
```
### Using `DeleteCourse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCourse, DeleteCourseVariables } from '@dataconnect/generated';

// The `DeleteCourse` mutation requires an argument of type `DeleteCourseVariables`:
const deleteCourseVars: DeleteCourseVariables = {
  id: ..., 
};

// Call the `deleteCourse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCourse(deleteCourseVars);
// Variables can be defined inline as well.
const { data } = await deleteCourse({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCourse(dataConnect, deleteCourseVars);

console.log(data.course_delete);

// Or, you can use the `Promise` API.
deleteCourse(deleteCourseVars).then((response) => {
  const data = response.data;
  console.log(data.course_delete);
});
```

### Using `DeleteCourse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCourseRef, DeleteCourseVariables } from '@dataconnect/generated';

// The `DeleteCourse` mutation requires an argument of type `DeleteCourseVariables`:
const deleteCourseVars: DeleteCourseVariables = {
  id: ..., 
};

// Call the `deleteCourseRef()` function to get a reference to the mutation.
const ref = deleteCourseRef(deleteCourseVars);
// Variables can be defined inline as well.
const ref = deleteCourseRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCourseRef(dataConnect, deleteCourseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.course_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.course_delete);
});
```

## CreateLecture
You can execute the `CreateLecture` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLecture(vars: CreateLectureVariables): MutationPromise<CreateLectureData, CreateLectureVariables>;

interface CreateLectureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLectureVariables): MutationRef<CreateLectureData, CreateLectureVariables>;
}
export const createLectureRef: CreateLectureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLecture(dc: DataConnect, vars: CreateLectureVariables): MutationPromise<CreateLectureData, CreateLectureVariables>;

interface CreateLectureRef {
  ...
  (dc: DataConnect, vars: CreateLectureVariables): MutationRef<CreateLectureData, CreateLectureVariables>;
}
export const createLectureRef: CreateLectureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLectureRef:
```typescript
const name = createLectureRef.operationName;
console.log(name);
```

### Variables
The `CreateLecture` mutation requires an argument of type `CreateLectureVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLectureVariables {
  topic: string;
  date: DateString;
  courseId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateLecture` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLectureData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLectureData {
  lecture_insert: Lecture_Key;
}
```
### Using `CreateLecture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLecture, CreateLectureVariables } from '@dataconnect/generated';

// The `CreateLecture` mutation requires an argument of type `CreateLectureVariables`:
const createLectureVars: CreateLectureVariables = {
  topic: ..., 
  date: ..., 
  courseId: ..., 
};

// Call the `createLecture()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLecture(createLectureVars);
// Variables can be defined inline as well.
const { data } = await createLecture({ topic: ..., date: ..., courseId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLecture(dataConnect, createLectureVars);

console.log(data.lecture_insert);

// Or, you can use the `Promise` API.
createLecture(createLectureVars).then((response) => {
  const data = response.data;
  console.log(data.lecture_insert);
});
```

### Using `CreateLecture`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLectureRef, CreateLectureVariables } from '@dataconnect/generated';

// The `CreateLecture` mutation requires an argument of type `CreateLectureVariables`:
const createLectureVars: CreateLectureVariables = {
  topic: ..., 
  date: ..., 
  courseId: ..., 
};

// Call the `createLectureRef()` function to get a reference to the mutation.
const ref = createLectureRef(createLectureVars);
// Variables can be defined inline as well.
const ref = createLectureRef({ topic: ..., date: ..., courseId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLectureRef(dataConnect, createLectureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lecture_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lecture_insert);
});
```

## UpdateLecture
You can execute the `UpdateLecture` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLecture(vars: UpdateLectureVariables): MutationPromise<UpdateLectureData, UpdateLectureVariables>;

interface UpdateLectureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLectureVariables): MutationRef<UpdateLectureData, UpdateLectureVariables>;
}
export const updateLectureRef: UpdateLectureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLecture(dc: DataConnect, vars: UpdateLectureVariables): MutationPromise<UpdateLectureData, UpdateLectureVariables>;

interface UpdateLectureRef {
  ...
  (dc: DataConnect, vars: UpdateLectureVariables): MutationRef<UpdateLectureData, UpdateLectureVariables>;
}
export const updateLectureRef: UpdateLectureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLectureRef:
```typescript
const name = updateLectureRef.operationName;
console.log(name);
```

### Variables
The `UpdateLecture` mutation requires an argument of type `UpdateLectureVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLectureVariables {
  id: UUIDString;
  topic?: string | null;
}
```
### Return Type
Recall that executing the `UpdateLecture` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLectureData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLectureData {
  lecture_update?: Lecture_Key | null;
}
```
### Using `UpdateLecture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLecture, UpdateLectureVariables } from '@dataconnect/generated';

// The `UpdateLecture` mutation requires an argument of type `UpdateLectureVariables`:
const updateLectureVars: UpdateLectureVariables = {
  id: ..., 
  topic: ..., // optional
};

// Call the `updateLecture()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLecture(updateLectureVars);
// Variables can be defined inline as well.
const { data } = await updateLecture({ id: ..., topic: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLecture(dataConnect, updateLectureVars);

console.log(data.lecture_update);

// Or, you can use the `Promise` API.
updateLecture(updateLectureVars).then((response) => {
  const data = response.data;
  console.log(data.lecture_update);
});
```

### Using `UpdateLecture`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLectureRef, UpdateLectureVariables } from '@dataconnect/generated';

// The `UpdateLecture` mutation requires an argument of type `UpdateLectureVariables`:
const updateLectureVars: UpdateLectureVariables = {
  id: ..., 
  topic: ..., // optional
};

// Call the `updateLectureRef()` function to get a reference to the mutation.
const ref = updateLectureRef(updateLectureVars);
// Variables can be defined inline as well.
const ref = updateLectureRef({ id: ..., topic: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLectureRef(dataConnect, updateLectureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lecture_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lecture_update);
});
```

## DeleteLecture
You can execute the `DeleteLecture` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteLecture(vars: DeleteLectureVariables): MutationPromise<DeleteLectureData, DeleteLectureVariables>;

interface DeleteLectureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLectureVariables): MutationRef<DeleteLectureData, DeleteLectureVariables>;
}
export const deleteLectureRef: DeleteLectureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteLecture(dc: DataConnect, vars: DeleteLectureVariables): MutationPromise<DeleteLectureData, DeleteLectureVariables>;

interface DeleteLectureRef {
  ...
  (dc: DataConnect, vars: DeleteLectureVariables): MutationRef<DeleteLectureData, DeleteLectureVariables>;
}
export const deleteLectureRef: DeleteLectureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteLectureRef:
```typescript
const name = deleteLectureRef.operationName;
console.log(name);
```

### Variables
The `DeleteLecture` mutation requires an argument of type `DeleteLectureVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteLectureVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteLecture` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteLectureData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteLectureData {
  lecture_delete?: Lecture_Key | null;
}
```
### Using `DeleteLecture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteLecture, DeleteLectureVariables } from '@dataconnect/generated';

// The `DeleteLecture` mutation requires an argument of type `DeleteLectureVariables`:
const deleteLectureVars: DeleteLectureVariables = {
  id: ..., 
};

// Call the `deleteLecture()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteLecture(deleteLectureVars);
// Variables can be defined inline as well.
const { data } = await deleteLecture({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteLecture(dataConnect, deleteLectureVars);

console.log(data.lecture_delete);

// Or, you can use the `Promise` API.
deleteLecture(deleteLectureVars).then((response) => {
  const data = response.data;
  console.log(data.lecture_delete);
});
```

### Using `DeleteLecture`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteLectureRef, DeleteLectureVariables } from '@dataconnect/generated';

// The `DeleteLecture` mutation requires an argument of type `DeleteLectureVariables`:
const deleteLectureVars: DeleteLectureVariables = {
  id: ..., 
};

// Call the `deleteLectureRef()` function to get a reference to the mutation.
const ref = deleteLectureRef(deleteLectureVars);
// Variables can be defined inline as well.
const ref = deleteLectureRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteLectureRef(dataConnect, deleteLectureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lecture_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lecture_delete);
});
```

## CreateNote
You can execute the `CreateNote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNote(vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;

interface CreateNoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
}
export const createNoteRef: CreateNoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNote(dc: DataConnect, vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;

interface CreateNoteRef {
  ...
  (dc: DataConnect, vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
}
export const createNoteRef: CreateNoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNoteRef:
```typescript
const name = createNoteRef.operationName;
console.log(name);
```

### Variables
The `CreateNote` mutation requires an argument of type `CreateNoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNoteVariables {
  rawContent: string;
  summaryContent: string;
  lectureId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateNote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNoteData {
  note_insert: Note_Key;
}
```
### Using `CreateNote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNote, CreateNoteVariables } from '@dataconnect/generated';

// The `CreateNote` mutation requires an argument of type `CreateNoteVariables`:
const createNoteVars: CreateNoteVariables = {
  rawContent: ..., 
  summaryContent: ..., 
  lectureId: ..., 
};

// Call the `createNote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNote(createNoteVars);
// Variables can be defined inline as well.
const { data } = await createNote({ rawContent: ..., summaryContent: ..., lectureId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNote(dataConnect, createNoteVars);

console.log(data.note_insert);

// Or, you can use the `Promise` API.
createNote(createNoteVars).then((response) => {
  const data = response.data;
  console.log(data.note_insert);
});
```

### Using `CreateNote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNoteRef, CreateNoteVariables } from '@dataconnect/generated';

// The `CreateNote` mutation requires an argument of type `CreateNoteVariables`:
const createNoteVars: CreateNoteVariables = {
  rawContent: ..., 
  summaryContent: ..., 
  lectureId: ..., 
};

// Call the `createNoteRef()` function to get a reference to the mutation.
const ref = createNoteRef(createNoteVars);
// Variables can be defined inline as well.
const ref = createNoteRef({ rawContent: ..., summaryContent: ..., lectureId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNoteRef(dataConnect, createNoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.note_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.note_insert);
});
```

## UpdateNote
You can execute the `UpdateNote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateNote(vars: UpdateNoteVariables): MutationPromise<UpdateNoteData, UpdateNoteVariables>;

interface UpdateNoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateNoteVariables): MutationRef<UpdateNoteData, UpdateNoteVariables>;
}
export const updateNoteRef: UpdateNoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateNote(dc: DataConnect, vars: UpdateNoteVariables): MutationPromise<UpdateNoteData, UpdateNoteVariables>;

interface UpdateNoteRef {
  ...
  (dc: DataConnect, vars: UpdateNoteVariables): MutationRef<UpdateNoteData, UpdateNoteVariables>;
}
export const updateNoteRef: UpdateNoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateNoteRef:
```typescript
const name = updateNoteRef.operationName;
console.log(name);
```

### Variables
The `UpdateNote` mutation requires an argument of type `UpdateNoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateNoteVariables {
  id: UUIDString;
  summary?: string | null;
}
```
### Return Type
Recall that executing the `UpdateNote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateNoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateNoteData {
  note_update?: Note_Key | null;
}
```
### Using `UpdateNote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateNote, UpdateNoteVariables } from '@dataconnect/generated';

// The `UpdateNote` mutation requires an argument of type `UpdateNoteVariables`:
const updateNoteVars: UpdateNoteVariables = {
  id: ..., 
  summary: ..., // optional
};

// Call the `updateNote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateNote(updateNoteVars);
// Variables can be defined inline as well.
const { data } = await updateNote({ id: ..., summary: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateNote(dataConnect, updateNoteVars);

console.log(data.note_update);

// Or, you can use the `Promise` API.
updateNote(updateNoteVars).then((response) => {
  const data = response.data;
  console.log(data.note_update);
});
```

### Using `UpdateNote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateNoteRef, UpdateNoteVariables } from '@dataconnect/generated';

// The `UpdateNote` mutation requires an argument of type `UpdateNoteVariables`:
const updateNoteVars: UpdateNoteVariables = {
  id: ..., 
  summary: ..., // optional
};

// Call the `updateNoteRef()` function to get a reference to the mutation.
const ref = updateNoteRef(updateNoteVars);
// Variables can be defined inline as well.
const ref = updateNoteRef({ id: ..., summary: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateNoteRef(dataConnect, updateNoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.note_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.note_update);
});
```

## DeleteNote
You can execute the `DeleteNote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteNote(vars: DeleteNoteVariables): MutationPromise<DeleteNoteData, DeleteNoteVariables>;

interface DeleteNoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteNoteVariables): MutationRef<DeleteNoteData, DeleteNoteVariables>;
}
export const deleteNoteRef: DeleteNoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteNote(dc: DataConnect, vars: DeleteNoteVariables): MutationPromise<DeleteNoteData, DeleteNoteVariables>;

interface DeleteNoteRef {
  ...
  (dc: DataConnect, vars: DeleteNoteVariables): MutationRef<DeleteNoteData, DeleteNoteVariables>;
}
export const deleteNoteRef: DeleteNoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteNoteRef:
```typescript
const name = deleteNoteRef.operationName;
console.log(name);
```

### Variables
The `DeleteNote` mutation requires an argument of type `DeleteNoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteNoteVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteNote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteNoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteNoteData {
  note_delete?: Note_Key | null;
}
```
### Using `DeleteNote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteNote, DeleteNoteVariables } from '@dataconnect/generated';

// The `DeleteNote` mutation requires an argument of type `DeleteNoteVariables`:
const deleteNoteVars: DeleteNoteVariables = {
  id: ..., 
};

// Call the `deleteNote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteNote(deleteNoteVars);
// Variables can be defined inline as well.
const { data } = await deleteNote({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteNote(dataConnect, deleteNoteVars);

console.log(data.note_delete);

// Or, you can use the `Promise` API.
deleteNote(deleteNoteVars).then((response) => {
  const data = response.data;
  console.log(data.note_delete);
});
```

### Using `DeleteNote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteNoteRef, DeleteNoteVariables } from '@dataconnect/generated';

// The `DeleteNote` mutation requires an argument of type `DeleteNoteVariables`:
const deleteNoteVars: DeleteNoteVariables = {
  id: ..., 
};

// Call the `deleteNoteRef()` function to get a reference to the mutation.
const ref = deleteNoteRef(deleteNoteVars);
// Variables can be defined inline as well.
const ref = deleteNoteRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteNoteRef(dataConnect, deleteNoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.note_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.note_delete);
});
```

## CreateFlashcard
You can execute the `CreateFlashcard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createFlashcard(vars: CreateFlashcardVariables): MutationPromise<CreateFlashcardData, CreateFlashcardVariables>;

interface CreateFlashcardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFlashcardVariables): MutationRef<CreateFlashcardData, CreateFlashcardVariables>;
}
export const createFlashcardRef: CreateFlashcardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFlashcard(dc: DataConnect, vars: CreateFlashcardVariables): MutationPromise<CreateFlashcardData, CreateFlashcardVariables>;

interface CreateFlashcardRef {
  ...
  (dc: DataConnect, vars: CreateFlashcardVariables): MutationRef<CreateFlashcardData, CreateFlashcardVariables>;
}
export const createFlashcardRef: CreateFlashcardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFlashcardRef:
```typescript
const name = createFlashcardRef.operationName;
console.log(name);
```

### Variables
The `CreateFlashcard` mutation requires an argument of type `CreateFlashcardVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateFlashcardVariables {
  question: string;
  answer: string;
  noteId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateFlashcard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFlashcardData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFlashcardData {
  flashcard_insert: Flashcard_Key;
}
```
### Using `CreateFlashcard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFlashcard, CreateFlashcardVariables } from '@dataconnect/generated';

// The `CreateFlashcard` mutation requires an argument of type `CreateFlashcardVariables`:
const createFlashcardVars: CreateFlashcardVariables = {
  question: ..., 
  answer: ..., 
  noteId: ..., 
};

// Call the `createFlashcard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFlashcard(createFlashcardVars);
// Variables can be defined inline as well.
const { data } = await createFlashcard({ question: ..., answer: ..., noteId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFlashcard(dataConnect, createFlashcardVars);

console.log(data.flashcard_insert);

// Or, you can use the `Promise` API.
createFlashcard(createFlashcardVars).then((response) => {
  const data = response.data;
  console.log(data.flashcard_insert);
});
```

### Using `CreateFlashcard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFlashcardRef, CreateFlashcardVariables } from '@dataconnect/generated';

// The `CreateFlashcard` mutation requires an argument of type `CreateFlashcardVariables`:
const createFlashcardVars: CreateFlashcardVariables = {
  question: ..., 
  answer: ..., 
  noteId: ..., 
};

// Call the `createFlashcardRef()` function to get a reference to the mutation.
const ref = createFlashcardRef(createFlashcardVars);
// Variables can be defined inline as well.
const ref = createFlashcardRef({ question: ..., answer: ..., noteId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFlashcardRef(dataConnect, createFlashcardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.flashcard_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.flashcard_insert);
});
```

## UpdateFlashcard
You can execute the `UpdateFlashcard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateFlashcard(vars: UpdateFlashcardVariables): MutationPromise<UpdateFlashcardData, UpdateFlashcardVariables>;

interface UpdateFlashcardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFlashcardVariables): MutationRef<UpdateFlashcardData, UpdateFlashcardVariables>;
}
export const updateFlashcardRef: UpdateFlashcardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateFlashcard(dc: DataConnect, vars: UpdateFlashcardVariables): MutationPromise<UpdateFlashcardData, UpdateFlashcardVariables>;

interface UpdateFlashcardRef {
  ...
  (dc: DataConnect, vars: UpdateFlashcardVariables): MutationRef<UpdateFlashcardData, UpdateFlashcardVariables>;
}
export const updateFlashcardRef: UpdateFlashcardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateFlashcardRef:
```typescript
const name = updateFlashcardRef.operationName;
console.log(name);
```

### Variables
The `UpdateFlashcard` mutation requires an argument of type `UpdateFlashcardVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateFlashcardVariables {
  id: UUIDString;
  answer?: string | null;
}
```
### Return Type
Recall that executing the `UpdateFlashcard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateFlashcardData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateFlashcardData {
  flashcard_update?: Flashcard_Key | null;
}
```
### Using `UpdateFlashcard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateFlashcard, UpdateFlashcardVariables } from '@dataconnect/generated';

// The `UpdateFlashcard` mutation requires an argument of type `UpdateFlashcardVariables`:
const updateFlashcardVars: UpdateFlashcardVariables = {
  id: ..., 
  answer: ..., // optional
};

// Call the `updateFlashcard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateFlashcard(updateFlashcardVars);
// Variables can be defined inline as well.
const { data } = await updateFlashcard({ id: ..., answer: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateFlashcard(dataConnect, updateFlashcardVars);

console.log(data.flashcard_update);

// Or, you can use the `Promise` API.
updateFlashcard(updateFlashcardVars).then((response) => {
  const data = response.data;
  console.log(data.flashcard_update);
});
```

### Using `UpdateFlashcard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateFlashcardRef, UpdateFlashcardVariables } from '@dataconnect/generated';

// The `UpdateFlashcard` mutation requires an argument of type `UpdateFlashcardVariables`:
const updateFlashcardVars: UpdateFlashcardVariables = {
  id: ..., 
  answer: ..., // optional
};

// Call the `updateFlashcardRef()` function to get a reference to the mutation.
const ref = updateFlashcardRef(updateFlashcardVars);
// Variables can be defined inline as well.
const ref = updateFlashcardRef({ id: ..., answer: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateFlashcardRef(dataConnect, updateFlashcardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.flashcard_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.flashcard_update);
});
```

## DeleteFlashcard
You can execute the `DeleteFlashcard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteFlashcard(vars: DeleteFlashcardVariables): MutationPromise<DeleteFlashcardData, DeleteFlashcardVariables>;

interface DeleteFlashcardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteFlashcardVariables): MutationRef<DeleteFlashcardData, DeleteFlashcardVariables>;
}
export const deleteFlashcardRef: DeleteFlashcardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteFlashcard(dc: DataConnect, vars: DeleteFlashcardVariables): MutationPromise<DeleteFlashcardData, DeleteFlashcardVariables>;

interface DeleteFlashcardRef {
  ...
  (dc: DataConnect, vars: DeleteFlashcardVariables): MutationRef<DeleteFlashcardData, DeleteFlashcardVariables>;
}
export const deleteFlashcardRef: DeleteFlashcardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteFlashcardRef:
```typescript
const name = deleteFlashcardRef.operationName;
console.log(name);
```

### Variables
The `DeleteFlashcard` mutation requires an argument of type `DeleteFlashcardVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteFlashcardVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteFlashcard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteFlashcardData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteFlashcardData {
  flashcard_delete?: Flashcard_Key | null;
}
```
### Using `DeleteFlashcard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteFlashcard, DeleteFlashcardVariables } from '@dataconnect/generated';

// The `DeleteFlashcard` mutation requires an argument of type `DeleteFlashcardVariables`:
const deleteFlashcardVars: DeleteFlashcardVariables = {
  id: ..., 
};

// Call the `deleteFlashcard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteFlashcard(deleteFlashcardVars);
// Variables can be defined inline as well.
const { data } = await deleteFlashcard({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteFlashcard(dataConnect, deleteFlashcardVars);

console.log(data.flashcard_delete);

// Or, you can use the `Promise` API.
deleteFlashcard(deleteFlashcardVars).then((response) => {
  const data = response.data;
  console.log(data.flashcard_delete);
});
```

### Using `DeleteFlashcard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteFlashcardRef, DeleteFlashcardVariables } from '@dataconnect/generated';

// The `DeleteFlashcard` mutation requires an argument of type `DeleteFlashcardVariables`:
const deleteFlashcardVars: DeleteFlashcardVariables = {
  id: ..., 
};

// Call the `deleteFlashcardRef()` function to get a reference to the mutation.
const ref = deleteFlashcardRef(deleteFlashcardVars);
// Variables can be defined inline as well.
const ref = deleteFlashcardRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteFlashcardRef(dataConnect, deleteFlashcardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.flashcard_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.flashcard_delete);
});
```

## CreateReminder
You can execute the `CreateReminder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createReminder(vars: CreateReminderVariables): MutationPromise<CreateReminderData, CreateReminderVariables>;

interface CreateReminderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateReminderVariables): MutationRef<CreateReminderData, CreateReminderVariables>;
}
export const createReminderRef: CreateReminderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createReminder(dc: DataConnect, vars: CreateReminderVariables): MutationPromise<CreateReminderData, CreateReminderVariables>;

interface CreateReminderRef {
  ...
  (dc: DataConnect, vars: CreateReminderVariables): MutationRef<CreateReminderData, CreateReminderVariables>;
}
export const createReminderRef: CreateReminderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createReminderRef:
```typescript
const name = createReminderRef.operationName;
console.log(name);
```

### Variables
The `CreateReminder` mutation requires an argument of type `CreateReminderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateReminderVariables {
  title: string;
  dueDate: TimestampString;
  courseId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateReminder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateReminderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateReminderData {
  reminder_insert: Reminder_Key;
}
```
### Using `CreateReminder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createReminder, CreateReminderVariables } from '@dataconnect/generated';

// The `CreateReminder` mutation requires an argument of type `CreateReminderVariables`:
const createReminderVars: CreateReminderVariables = {
  title: ..., 
  dueDate: ..., 
  courseId: ..., 
};

// Call the `createReminder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createReminder(createReminderVars);
// Variables can be defined inline as well.
const { data } = await createReminder({ title: ..., dueDate: ..., courseId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createReminder(dataConnect, createReminderVars);

console.log(data.reminder_insert);

// Or, you can use the `Promise` API.
createReminder(createReminderVars).then((response) => {
  const data = response.data;
  console.log(data.reminder_insert);
});
```

### Using `CreateReminder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createReminderRef, CreateReminderVariables } from '@dataconnect/generated';

// The `CreateReminder` mutation requires an argument of type `CreateReminderVariables`:
const createReminderVars: CreateReminderVariables = {
  title: ..., 
  dueDate: ..., 
  courseId: ..., 
};

// Call the `createReminderRef()` function to get a reference to the mutation.
const ref = createReminderRef(createReminderVars);
// Variables can be defined inline as well.
const ref = createReminderRef({ title: ..., dueDate: ..., courseId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createReminderRef(dataConnect, createReminderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.reminder_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.reminder_insert);
});
```

## UpdateReminder
You can execute the `UpdateReminder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateReminder(vars: UpdateReminderVariables): MutationPromise<UpdateReminderData, UpdateReminderVariables>;

interface UpdateReminderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateReminderVariables): MutationRef<UpdateReminderData, UpdateReminderVariables>;
}
export const updateReminderRef: UpdateReminderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateReminder(dc: DataConnect, vars: UpdateReminderVariables): MutationPromise<UpdateReminderData, UpdateReminderVariables>;

interface UpdateReminderRef {
  ...
  (dc: DataConnect, vars: UpdateReminderVariables): MutationRef<UpdateReminderData, UpdateReminderVariables>;
}
export const updateReminderRef: UpdateReminderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateReminderRef:
```typescript
const name = updateReminderRef.operationName;
console.log(name);
```

### Variables
The `UpdateReminder` mutation requires an argument of type `UpdateReminderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateReminderVariables {
  id: UUIDString;
  title?: string | null;
}
```
### Return Type
Recall that executing the `UpdateReminder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateReminderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateReminderData {
  reminder_update?: Reminder_Key | null;
}
```
### Using `UpdateReminder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateReminder, UpdateReminderVariables } from '@dataconnect/generated';

// The `UpdateReminder` mutation requires an argument of type `UpdateReminderVariables`:
const updateReminderVars: UpdateReminderVariables = {
  id: ..., 
  title: ..., // optional
};

// Call the `updateReminder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateReminder(updateReminderVars);
// Variables can be defined inline as well.
const { data } = await updateReminder({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateReminder(dataConnect, updateReminderVars);

console.log(data.reminder_update);

// Or, you can use the `Promise` API.
updateReminder(updateReminderVars).then((response) => {
  const data = response.data;
  console.log(data.reminder_update);
});
```

### Using `UpdateReminder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateReminderRef, UpdateReminderVariables } from '@dataconnect/generated';

// The `UpdateReminder` mutation requires an argument of type `UpdateReminderVariables`:
const updateReminderVars: UpdateReminderVariables = {
  id: ..., 
  title: ..., // optional
};

// Call the `updateReminderRef()` function to get a reference to the mutation.
const ref = updateReminderRef(updateReminderVars);
// Variables can be defined inline as well.
const ref = updateReminderRef({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateReminderRef(dataConnect, updateReminderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.reminder_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.reminder_update);
});
```

## DeleteReminder
You can execute the `DeleteReminder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteReminder(vars: DeleteReminderVariables): MutationPromise<DeleteReminderData, DeleteReminderVariables>;

interface DeleteReminderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteReminderVariables): MutationRef<DeleteReminderData, DeleteReminderVariables>;
}
export const deleteReminderRef: DeleteReminderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteReminder(dc: DataConnect, vars: DeleteReminderVariables): MutationPromise<DeleteReminderData, DeleteReminderVariables>;

interface DeleteReminderRef {
  ...
  (dc: DataConnect, vars: DeleteReminderVariables): MutationRef<DeleteReminderData, DeleteReminderVariables>;
}
export const deleteReminderRef: DeleteReminderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteReminderRef:
```typescript
const name = deleteReminderRef.operationName;
console.log(name);
```

### Variables
The `DeleteReminder` mutation requires an argument of type `DeleteReminderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteReminderVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteReminder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteReminderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteReminderData {
  reminder_delete?: Reminder_Key | null;
}
```
### Using `DeleteReminder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteReminder, DeleteReminderVariables } from '@dataconnect/generated';

// The `DeleteReminder` mutation requires an argument of type `DeleteReminderVariables`:
const deleteReminderVars: DeleteReminderVariables = {
  id: ..., 
};

// Call the `deleteReminder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteReminder(deleteReminderVars);
// Variables can be defined inline as well.
const { data } = await deleteReminder({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteReminder(dataConnect, deleteReminderVars);

console.log(data.reminder_delete);

// Or, you can use the `Promise` API.
deleteReminder(deleteReminderVars).then((response) => {
  const data = response.data;
  console.log(data.reminder_delete);
});
```

### Using `DeleteReminder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteReminderRef, DeleteReminderVariables } from '@dataconnect/generated';

// The `DeleteReminder` mutation requires an argument of type `DeleteReminderVariables`:
const deleteReminderVars: DeleteReminderVariables = {
  id: ..., 
};

// Call the `deleteReminderRef()` function to get a reference to the mutation.
const ref = deleteReminderRef(deleteReminderVars);
// Variables can be defined inline as well.
const ref = deleteReminderRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteReminderRef(dataConnect, deleteReminderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.reminder_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.reminder_delete);
});
```

