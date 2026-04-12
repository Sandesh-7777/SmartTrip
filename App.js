import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './app/store/index';
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppNavigator />
    </Provider>
  );
}