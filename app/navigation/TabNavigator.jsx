import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

import HomeScreen from '../screens/home/HomeScreen';
import TripsScreen from '../screens/trip/TripsScreen';
import TripPlannerScreen from '../screens/trip/TripPlannerScreen';
import ItineraryScreen from '../screens/trip/ItineraryScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import HotelsScreen from '../screens/booking/HotelsScreen';
import BusesScreen from '../screens/booking/BusesScreen';
import TrainsScreen from '../screens/booking/TrainsScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import PackagesScreen from '../screens/packages/PackagesScreen';
import PackageDetailScreen from '../screens/packages/PackageDetailScreen';
import GroupsScreen from '../screens/group/GroupsScreen';
import GroupDetailScreen from '../screens/group/GroupDetailScreen';
import ExpenseScreen from '../screens/expense/ExpenseScreen';
import GroupExpensesScreen from '../screens/expense/GroupExpensesScreen';
import SplitBillScreen from '../screens/expense/SplitBillScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const TripStack = createStackNavigator();
const BookingStack = createStackNavigator();
const PackageStack = createStackNavigator();
const GroupStack = createStackNavigator();
const ExpenseStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderEmoji}>🚧</Text>
    <Text style={styles.placeholderText}>{route.name}</Text>
    <Text style={styles.placeholderSub}>Coming soon...</Text>
  </View>
);

const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.tabIconBox}>
    <Text style={styles.tabIcon}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

function TripStackNavigator() {
  return (
    <TripStack.Navigator screenOptions={{ headerShown: false }}>
      <TripStack.Screen name="TripsList" component={TripsScreen} />
      <TripStack.Screen name="TripPlanner" component={TripPlannerScreen} />
      <TripStack.Screen name="Itinerary" component={ItineraryScreen} />
    </TripStack.Navigator>
  );
}

function BookingStackNavigator() {
  return (
    <BookingStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingStack.Screen name="BookingHome" component={BookingScreen} />
      <BookingStack.Screen name="Hotels" component={HotelsScreen} />
      <BookingStack.Screen name="Buses" component={BusesScreen} />
      <BookingStack.Screen name="Trains" component={TrainsScreen} />
      <BookingStack.Screen name="MyBookings" component={MyBookingsScreen} />
    </BookingStack.Navigator>
  );
}

function PackageStackNavigator() {
  return (
    <PackageStack.Navigator screenOptions={{ headerShown: false }}>
      <PackageStack.Screen name="PackagesList" component={PackagesScreen} />
      <PackageStack.Screen name="PackageDetail" component={PackageDetailScreen} />
    </PackageStack.Navigator>
  );
}

function GroupStackNavigator() {
  return (
    <GroupStack.Navigator screenOptions={{ headerShown: false }}>
      <GroupStack.Screen name="GroupsList" component={GroupsScreen} />
      <GroupStack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <GroupStack.Screen name="GroupExpenses" component={GroupExpensesScreen} />
      <GroupStack.Screen name="SplitBill" component={SplitBillScreen} />
      <GroupStack.Screen name="Expenses" component={ExpenseScreen} />
    </GroupStack.Navigator>
  );
}

function ExpenseStackNavigator() {
  return (
    <ExpenseStack.Navigator screenOptions={{ headerShown: false }}>
      <ExpenseStack.Screen name="ExpenseHome" component={ExpenseScreen} />
    </ExpenseStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Expenses" component={ExpenseScreen} />
    </ProfileStack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70, paddingBottom: 10, paddingTop: 4,
          backgroundColor: COLORS.white, borderTopWidth: 0,
          shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> }}
      />
      <Tab.Screen name="Trips" component={TripStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" label="Trips" focused={focused} /> }}
      />
      <Tab.Screen name="Bookings" component={BookingStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🎫" label="Bookings" focused={focused} /> }}
      />
      <Tab.Screen name="Packages" component={PackageStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📦" label="Packages" focused={focused} /> }}
      />
      <Tab.Screen name="Groups" component={GroupStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👥" label="Groups" focused={focused} /> }}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} /> }}
      />
      {/* <Tab.Screen name="Expenses" component={ExpenseScreen} 
      options={{ tabBarButton: () => null, tabBarStyle: { display: 'none' }, }}
      /> */}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', backgroundColor: COLORS.background,
  },
  placeholderEmoji: { fontSize: 48, marginBottom: 12 },
  placeholderText: { fontSize: 22, fontWeight: 'bold', color: COLORS.black },
  placeholderSub: { fontSize: 14, color: COLORS.gray, marginTop: 8 },
  tabIconBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 10, color: COLORS.gray, marginTop: 2, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary },
});