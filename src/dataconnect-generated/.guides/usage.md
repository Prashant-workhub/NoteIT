# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateStudent, useUpdateStudent, useDeleteStudent, useGetMyStudent, useListStudents, useCreateCourse, useUpdateCourse, useDeleteCourse, useGetCourse, useListMyCourses } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateStudent();

const { data, isPending, isSuccess, isError, error } = useUpdateStudent(updateStudentVars);

const { data, isPending, isSuccess, isError, error } = useDeleteStudent();

const { data, isPending, isSuccess, isError, error } = useGetMyStudent();

const { data, isPending, isSuccess, isError, error } = useListStudents();

const { data, isPending, isSuccess, isError, error } = useCreateCourse(createCourseVars);

const { data, isPending, isSuccess, isError, error } = useUpdateCourse(updateCourseVars);

const { data, isPending, isSuccess, isError, error } = useDeleteCourse(deleteCourseVars);

const { data, isPending, isSuccess, isError, error } = useGetCourse(getCourseVars);

const { data, isPending, isSuccess, isError, error } = useListMyCourses();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createStudent, updateStudent, deleteStudent, getMyStudent, listStudents, createCourse, updateCourse, deleteCourse, getCourse, listMyCourses } from '@dataconnect/generated';


// Operation CreateStudent: 
const { data } = await CreateStudent(dataConnect);

// Operation UpdateStudent:  For variables, look at type UpdateStudentVars in ../index.d.ts
const { data } = await UpdateStudent(dataConnect, updateStudentVars);

// Operation DeleteStudent: 
const { data } = await DeleteStudent(dataConnect);

// Operation GetMyStudent: 
const { data } = await GetMyStudent(dataConnect);

// Operation ListStudents: 
const { data } = await ListStudents(dataConnect);

// Operation CreateCourse:  For variables, look at type CreateCourseVars in ../index.d.ts
const { data } = await CreateCourse(dataConnect, createCourseVars);

// Operation UpdateCourse:  For variables, look at type UpdateCourseVars in ../index.d.ts
const { data } = await UpdateCourse(dataConnect, updateCourseVars);

// Operation DeleteCourse:  For variables, look at type DeleteCourseVars in ../index.d.ts
const { data } = await DeleteCourse(dataConnect, deleteCourseVars);

// Operation GetCourse:  For variables, look at type GetCourseVars in ../index.d.ts
const { data } = await GetCourse(dataConnect, getCourseVars);

// Operation ListMyCourses: 
const { data } = await ListMyCourses(dataConnect);


```