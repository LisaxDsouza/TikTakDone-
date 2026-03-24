// ============================================================
// App.tsx – Root component: wraps app in the Redux Provider
// ============================================================
import React from 'react';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import {COLORS} from './src/constants';

const App: React.FC = () => (
  <Provider store={store}>
    <StatusBar
      barStyle="light-content"
      backgroundColor={COLORS.bgDark}
      translucent={false}
    />
    <AppNavigator />
  </Provider>
);

export default App;
