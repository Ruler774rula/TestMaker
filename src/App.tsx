import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SubjectDetails } from './pages/SubjectDetails';
import { TestConfig } from './pages/TestConfig';
import { TestRunner } from './pages/TestRunner';
import { Results } from './pages/Results';
import { Editor } from './pages/Editor';
import { ManageSubjects } from './pages/ManageSubjects';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage-subjects" element={<ManageSubjects />} />
            <Route path="/subject/:id" element={<SubjectDetails />} />
            <Route path="/config/:testId" element={<TestConfig />} />
            <Route path="/runner" element={<TestRunner />} />
            <Route path="/results" element={<Results />} />
            <Route path="/editor/:subjectId/:testId" element={<Editor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
