import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import ListenScreen from './src/screens/ListenScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, color, size, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#a855f7',
          tabBarInactiveTintColor: '#475569',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={
                route.name === 'Listen' ? 'mic-circle' :
                route.name === 'Chat' ? 'chatbubbles' :
                'settings'
              }
              color={color} size={size} focused={focused}
            />
          ),
          tabBarLabelStyle: styles.tabLabel,
        })}
      >
        <Tab.Screen name="Listen" component={ListenScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderTopColor: 'rgba(168,85,247,0.15)',
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 28,
    paddingTop: 10,
    position: 'absolute',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(168,85,247,0.15)',
  },
});
