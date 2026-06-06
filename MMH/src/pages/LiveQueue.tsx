import React, { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store';
import { setCurrentToken, setWaitTime } from '../store/queueSlice';
import api from '../api/axios';

export default function LiveQueue() {
  const dispatch = useDispatch();
  const currentToken = useSelector((state: RootState) => state.queue.currentToken);
  const myToken = useSelector((state: RootState) => state.queue.myToken);

  useEffect(() => {
    // 1. Connect to websocket
    socketService.connect();

    // 2. Fetch initial queue state
    const fetchQueue = async () => {
      try {
        const response = await api.get('/queue');
        if (response.data.currentToken) {
          dispatch(setCurrentToken(response.data.currentToken));
        }
      } catch (error) {
        console.error('Failed to fetch initial queue:', error);
      }
    };
    fetchQueue();

    // 3. Listen for live updates
    socketService.onQueueUpdated((data) => {
      dispatch(setCurrentToken(data.currentToken));
      // Simple logic: wait time = 10 mins per person ahead
      if (myToken && data.currentToken) {
        const peopleAhead = Math.max(0, myToken - data.currentToken);
        dispatch(setWaitTime(peopleAhead * 10));
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [dispatch, myToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-healthcare-blue/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-healthcare-text">Live Queue Status</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Real-time tracking of consultation tokens
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-healthcare-blue text-white rounded-lg p-8 text-center shadow-md">
            <p className="text-lg font-medium opacity-90">Currently Serving</p>
            <p className="text-6xl font-bold mt-2">
              {currentToken !== null ? `#${currentToken}` : '---'}
            </p>
          </div>

          {myToken && (
            <div className="bg-healthcare-teal/10 border border-healthcare-teal text-healthcare-teal rounded-lg p-6 text-center">
              <p className="text-md font-medium">Your Token</p>
              <p className="text-4xl font-bold mt-1">#{myToken}</p>
              {currentToken !== null && myToken > currentToken && (
                <p className="mt-4 text-sm font-semibold">
                  Estimated wait: {(myToken - currentToken) * 10} minutes
                </p>
              )}
            </div>
          )}

          {!myToken && (
            <div className="text-center text-gray-500 italic">
              You do not have an active token for today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
