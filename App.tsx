import React, {useCallback, useMemo, useReducer, useRef, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Lap from './components/Lap';
import RoundedButton from './components/RoundedButton';
import {COLORS} from './utils/constants';

type TStatus = 'idle' | 'start' | 'stop';

interface IState {
  status: TStatus;
  laps: number[];
}

type ACTIONTYPE =
  | {type: 'START'}
  | {type: 'STOP'}
  | {type: 'LAP'; payload: IState['laps'][0]}
  | {type: 'RESET'};

const initialState: IState = {
  status: 'idle',
  laps: [],
};

const reducer = (state: IState, action: ACTIONTYPE): IState => {
  switch (action.type) {
    case 'START':
      return {...state, status: 'start'};

    case 'STOP':
      return {...state, status: 'stop'};

    case 'LAP':
      return {...state, laps: [action.payload, ...state.laps]};

    case 'RESET':
      return {...initialState};

    default:
      throw new Error('Unhandled action type.');
  }
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [state, dispatch] = useReducer(reducer, initialState);

  const [initialTime, setInitialTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const interval = useRef<NodeJS.Timer | undefined>();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [leftButtonLabel, rightButtonLabel] = useMemo((): [string, string] => {
    switch (state.status) {
      case 'idle':
        return ['Lap', 'Start'];

      case 'start':
        return ['Lap', 'Stop'];

      case 'stop':
        return ['Reset', 'Start'];

      default:
        throw new Error('Invalid status');
    }
  }, [state.status]);

  /**
   * Takes the timestamp (in ms) and converts it to
   * string to display for stop watch.
   */
  const formatTimer = useCallback((timeStamp: number) => {
    const minutes = Math.floor(timeStamp / (1000 * 60));
    const seconds = Math.floor((timeStamp - minutes * 60 * 1000) / 1000);
    // Here, /10 isn't necessariy.
    const milSeconds = Math.floor((timeStamp % 1000) / 10);
    return `${minutes > 0 ? minutes : '00'}:${seconds > 0 ? seconds : '00'}.${
      milSeconds > 0 ? milSeconds : '00'
    }`;
  }, []);

  /**
   * Function that takes localInitTime (when the button start/stop is pressed) and
   * sets the currentTime based on that and paused time.
   */
  const tick = useCallback(
    (localInitTime: number) => {
      const crrTime = new Date().getTime();

      const crrCountingTime = pausedTime + crrTime - localInitTime;

      setCurrentTime(crrCountingTime);
    },
    [pausedTime],
  );

  const onStartOrStop = () => {
    const localInitTime = new Date().getTime();
    if (state.status === 'idle' || state.status === 'stop') {
      // Start the timer for the first time.
      dispatch({type: 'START'});
      setInitialTime(localInitTime);
      interval.current = setInterval(() => tick(localInitTime), 10);
    } else if (state.status === 'start') {
      // Stop the current timer (pause)
      dispatch({type: 'STOP'});
      if (interval.current) {
        setPausedTime(pausedTime + new Date().getTime() - initialTime);
        clearInterval(interval.current);
      }
    }
  };

  const onLapOrReset = () => {
    if (state.status === 'idle' || state.status === 'start') {
      // Lap
      let crrLapTime: number;
      if (state.laps.length) {
        // check last lap times.
        const lastLapTime = state.laps.reduce((a, b) => a + b, 0);
        crrLapTime = currentTime - lastLapTime;
      } else {
        crrLapTime = currentTime;
      }
      dispatch({type: 'LAP', payload: crrLapTime});
    } else if (state.status === 'stop') {
      // Reset
      dispatch({type: 'RESET'});
      setCurrentTime(0);
      if (interval.current) {
        clearInterval(interval.current);
      }
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
          ...styles.container,
        }}>
        <View style={styles.section}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTimer(currentTime)}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            <RoundedButton
              disabled={state.status === 'idle'}
              label={leftButtonLabel}
              onPress={onLapOrReset}
            />
            <RoundedButton
              label={rightButtonLabel}
              onPress={onStartOrStop}
              bgColor={`${
                state.status === 'idle' || state.status === 'stop'
                  ? COLORS.greenBg
                  : COLORS.redBg
              }`}
              textColor={`${
                state.status === 'idle' || state.status === 'stop'
                  ? COLORS.greenText
                  : COLORS.redText
              }`}
            />
          </View>
        </View>
        <FlatList
          style={styles.section}
          data={state.laps}
          renderItem={({item, index}) => {
            return (
              <Lap
                label={`Lap ${state.laps.length - index}`}
                value={formatTimer(item)}
              />
            );
          }}
          ItemSeparatorComponent={() => {
            return <View style={styles.separator} />;
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
  },
  section: {
    height: '50%',
    padding: 20,
  },
  timerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  timerText: {
    fontSize: 70,
    fontWeight: '500',
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
  },
});

export default App;
