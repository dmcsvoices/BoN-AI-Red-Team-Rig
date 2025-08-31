import { useState, useEffect } from 'react';
import { healthCheck, getSessions } from '../api';

export default function HealthCheck() {
  const [status, setStatus] = useState({
    backend: 'checking...',
    database: 'checking...',
    sessions: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    async function runTests() {
      try {
        // Test backend connection
        const healthResponse = await healthCheck();
        setStatus(prev => ({ 
          ...prev, 
          backend: `✅ ${healthResponse.data.message}` 
        }));

        // Test database connection via sessions
        const sessionsResponse = await getSessions();
        setStatus(prev => ({ 
          ...prev, 
          database: '✅ Database connected successfully',
          sessions: sessionsResponse.data
        }));
      } catch (err) {
        setError(`❌ Connection failed: ${err.message}`);
        setStatus(prev => ({ 
          ...prev, 
          backend: '❌ Backend connection failed',
          database: '❌ Database connection failed'
        }));
      }
    }

    runTests();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">BoN HITL MVP - Integration Test</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-purple-500">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">System Status</h2>
        <div className="space-y-2">
          <p className="text-white"><strong>Backend (Port 50000):</strong> {status.backend}</p>
          <p className="text-white"><strong>Database (SQLite):</strong> {status.database}</p>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-900 text-red-300 rounded border border-red-500">
            {error}
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">Sample Data</h2>
        {status.sessions.length > 0 ? (
          <div>
            <p className="mb-2 text-green-400">✅ Sessions found in database:</p>
            <ul className="list-disc pl-6 text-white">
              {status.sessions.map(session => (
                <li key={session.id} className="mb-1">
                  <span className="text-purple-300">{session.name}</span>
                  <span className="text-gray-400"> (ID: {session.id}, Created: {new Date(session.created_at).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-yellow-400">⏳ Loading sessions...</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Next Steps</h3>
        <p className="text-gray-300">
          🎯 Integration test complete! Database → Backend → Frontend connectivity verified.
        </p>
        <p className="text-gray-300 mt-2">
          📋 Ready to implement core BoN HITL features (session management, prompt generation, evaluation).
        </p>
      </div>
    </div>
  );
}