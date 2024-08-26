"use client"

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import data from '@/public/data.json';

interface Student {
  studentID: string;
  name: string;
  programme: string;
  room: string;
}

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="text-danger m-2 w-30 text-center" role="alert">
    {message}
  </div>
);

const Loader: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center bg-dark text-light" style={{ height: '100vh', width: '100vw' }}>
    <div className="spinner-grow" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const RoomFinder: React.FC = () => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [studentID, setStudentID] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [inputLabel, setInputLabel] = useState<string>('Enter Your Name or KRMU Application ID');
  const [promptForID, setPromptForID] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      fetch('/data.json')
        .then((response) => response.json())
        .then((data) => {
          const uniqueCourses = Array.from(new Set<string>(data.Data.map((student: Student) => student.programme)));
          setCourses(uniqueCourses);
          setLoading(false);
        });
    }, 2500);
  }, []);

  const isApplicationID = useCallback((value: string) => /^KRMU\d{7}$/.test(value), []);

  const findStudent = useCallback(() => {
    if (!selectedCourse || !input) {
      setError('Please select a course and enter your name or KRMU Application ID.');
      return [];
    }

    if (isApplicationID(input)) {
      return data.Data.filter(
        (student: Student) => student.programme === selectedCourse && student.studentID === input
      );
    } else {
      return data.Data.filter(
        (student: Student) => student.programme === selectedCourse && student.name.toLowerCase() === input.toLowerCase()
      );
    }
  }, [selectedCourse, input, isApplicationID]);

  const handleSearch = () => {
    setError('');
    setRoom('');
    setPromptForID(false);
    setButtonLoading(true);

    setTimeout(() => {
      const filteredStudents = findStudent();

      if (filteredStudents.length === 0) {
        setError('No student found with the provided details.');
      } else if (filteredStudents.length === 1) {
        setRoom(filteredStudents[0].room);
        setShowForm(false);
      } else {
        setInput('');
        setInputLabel('Enter KRMU Application ID to Continue');
        setPromptForID(true);
        setError('Multiple students found with the same name. Please enter your KRMU Application ID.');
      }

      setButtonLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setShowForm(true);
    setSelectedCourse('');
    setInput('');
    setStudentID('');
    setRoom('');
    setError('');
    setPromptForID(false);
    setInputLabel('Enter Your Name or KRMU Application ID');
  };

  if (loading) return <Loader />;

return (
  <div
    className="flex flex-col items-center justify-center bg-dark text-light"
    style={{ height: '100vh', width: '100vw' }}
  >
    <Image
      style={{ width: '250px', marginBottom: '50px' }}
      src="/logoGroup.webp"
      alt=""
      className="d-block mx-auto"
      width={500}
      height={500}
    />
    <h4 className="text-center mb-2">Find Your Allotted Room for</h4>
    <h1 className="text-center mb-6">Induction 2024 - SOET</h1>

    {showForm && (
      <>
        <div className="mb-3 w-10/12 md:w-1/3 lg:w-2/5">
          <label htmlFor="courseSelect" className="form-label">Select Your Course</label>
          <select
            id="courseSelect"
            className="form-select bg-dark text-light border-secondary"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>{course}</option>
            ))}
          </select>
        </div>

        {!promptForID && (
          <div className="mb-3 w-10/12 md:w-1/3 lg:w-2/5">
            <label htmlFor="inputField" className="form-label">{inputLabel}</label>
            <input
              type="text"
              id="inputField"
              className="form-control bg-dark text-light border-secondary"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        )}

        {promptForID && (
          <div className="mb-4 w-10/12 md:w-1/3 lg:w-2/5">
            <label htmlFor="idInput" className="form-label">Enter Your KRMU Application ID</label>
            <input
              type="text"
              id="idInput"
              className="form-control bg-dark text-light border-secondary"
              value={studentID}
              onChange={(e) => setStudentID(e.target.value)}
            />
          </div>
        )}

        <button className="btn btn-primary btn-md flex items-center" onClick={handleSearch} disabled={buttonLoading}>
          Find Room
          {buttonLoading && (
            <div className='ms-2'>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </div>
          )}
        </button>
      </>
    )}

    {error && <ErrorMessage message={error} />}

    {room && (
      <div className="mt-4 w-4/5 text-center">
        <h3 className="text-xl">Your Allotted Room: <strong>{room}</strong></h3>
        <p className="text-lg mt-4">Instructions:</p>
        <p>
          Upon arriving at the College, you’re requested to locate <br />
          <strong className="text-xl">{room[0]} Block</strong>.<br />
          Proceed to the <br />
          <strong className="text-2xl font-bold">{room[1]}{room[1] === '1' ? 'st' : room[1] === '2' ? 'nd' : room[1] === '3' ? 'rd' : 'th'} floor</strong>.<br />
          Find <br />
          <strong className="text-2xl font-bold">Room Number {room}</strong><br />
          on that floor.
        </p>
        <p className="mt-4">
          An Escort Team will be there to help you out in case you are unable to find the room. All the best!
        </p>
        <button className="btn btn-link mt-3" onClick={handleReset}>Search Another</button>
      </div>
    )}
  </div>
);
};

export default RoomFinder;