import React, {  useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import {useDispatch,useSelector} from "react-redux"
import { settingsActions } from '../../store/SettingsSlice';

const Settings = () => {

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.settings.userId);
  const data = useSelector((state) => state.settings.data);
  const index = useSelector((state) => state.settings.index);
  const username = useSelector((state) => state.settings.username);
  const isUsernameChanged = useSelector(
    (state) => state.settings.isUsernameChanged
  );


  const score = Cookies.get('score') || 0;

  useEffect(() => {
    if (!userId) {
      const id = uuidv4();
      const shortUuid = id.slice(0, 8);
      Cookies.set('userId', shortUuid, { secure: true });
      dispatch(settingsActions.setUserId(shortUuid));

    }
  }, [userId,dispatch]);

//   const storedUsername = Cookies.get('username') || 'Guest';
//   dispatch(settingsActions.setUsername(storedUsername));


//   // If the stored username is "Guest", set isUsernameChanged to false
//   dispatch(settingsActions.setIsUsernameChanged(storedUsername !== 'Guest'));


//   const storedScore = Cookies.get('score') || 0;
//   Cookies.set('score', storedScore, { secure: true });
// }, [userId,dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/allusers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const userData = await response.json();
        dispatch(settingsActions.setData(userData))
        // setData(userData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const foundUser = data.find((user) => user.username === username);
    if (foundUser) {
      dispatch(settingsActions.setIndex(data.indexOf(foundUser)));

    } else {
      dispatch(settingsActions.setIndex(data.indexOf(foundUser)));

    }
  }, [username, data,dispatch]);

  const saveUser = async (username) => {
    try {
      const response = await fetch('http://localhost:3001/saveuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
        }),
        credentials: 'include', 
      });
      const data = await response.json();
      username(data.username);
      score(data.points);
    } catch (error) {
      console.error(error);
    }
  };

  const usernameReset = () => {
    if (isUsernameChanged) {
      return;
    }
    let newUsername = prompt('Please enter a new username');
    const checkUsername = async () => {
      if (newUsername === null || newUsername === '') {
        newUsername = prompt('Please enter a new username');
        checkUsername();
      }
      const newUser = await saveUser(newUsername, score);
      if (newUser.error) {
        newUsername = prompt(newUser.error);
        checkUsername();
      }
      dispatch(settingsActions.setUsername(Cookies.get('username')));
      dispatch(settingsActions.setIsUsernameChanged(true));
    };
    checkUsername();
  };
  
  return (
      <div className="settings-container">
        <p>
          Current ID:{' '}
          <span>
            <u>{userId}</u>
          </span>
        </p>
        <p>
          Current User: <span>{username}</span>
        </p>
        <p>
          Current Score: <span>{score}</span>
        </p>
        <p>
          Current Rank: <span>#{index === -1 ? 'N/A' : index + 1}</span>
        </p>
        <div className="reset-container">
          {isUsernameChanged ? null : (
            <div>
              <p>Must set a username to see your leaderboard rank</p>
              <br />
              <h5>
                Can only be changed
                <span style={{ color: '#e34234' }}>
                  <u>ONCE</u>
                </span>
              </h5>
              <p>
                <span className="reset-text" onClick={usernameReset}>
                  Change
                </span>
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Settings;
