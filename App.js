import React, { createContext, useContext, useState, component } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const ThemeContext = createContext();

const theme = {
  dark: false,
  colors: {
    primary: '#4CAF50',
    background: '#F5F5F5',
    card: '#008000',
    text: '#1c1c1c',
    border: '#4CAF50',
    notification: '#4CAF50',
  },
};

const handleLogin = (email, password) => {
  console.log("handleLogin")
  console.log("Email: " + email);
  console.log("Password: " + password);
  const url = 'http://localhost:3333/api/1.0.0/login';

  // handle login
  var validator = require("email-validator");
  console.log((validator.validate(email))); //true

  const pwRX = new RegExp("^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")
  console.log(pwRX.test(password));
  //greater than 8 characters, including: one uppercase, one number and one special

  try{
    fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });
  }
  catch (error){
    console.error(error);
  }

};

function ThemeProvider({ children }) {
  console.log("ThemeProvider")
  const [isDarkMode, setIsDarkMode] = useState(false);
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, currentStyles }}>
      {children}
    </ThemeContext.Provider>
  );
}

function LoginScreen({ navigation }) {
  console.log("LoginScreen")
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const { currentStyles } = useContext(ThemeContext);
  return (
    <View style={currentStyles.container}>
      <View style={currentStyles.titleContainer}>
        <Text style={currentStyles.whatsThat}>whatsThat</Text>
        <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
      </View>
      <View style={currentStyles.inputContainer}>
        <TextInput
          style={currentStyles.input}
          placeholder="Email"
          placeholderTextColor="#c4c4c4"
          value={inputEmail}
          onChangeText={setInputEmail}
        />
      </View>
      <View style={currentStyles.inputContainer}>
        <TextInput
          secureTextEntry={true}
          style={currentStyles.input}
          placeholder="Password"
          placeholderTextColor="#c4c4c4"
          value={inputPassword}
          onChangeText={setInputPassword}
        /> 
      </View>
      <Pressable  style={currentStyles.btn}  
      onPress={() => handleLogin(inputEmail, inputPassword)}>
        <Text style={currentStyles.btnText} >Login</Text>
      </Pressable>
      <Pressable  style={currentStyles.btn}  
      onPress={() => navigation.navigate('Register')}>
        <Text style={currentStyles.btnText} >Don't have an account? Register here</Text>
      </Pressable>
    </View>
  );
};

function RegisterScreen() {
  console.log("RegisterScreen")
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputFname, setInputFname] = useState('');
  const [inputLname, setInputLname] = useState('');
  const { currentStyles } = useContext(ThemeContext);

  return (
    <ScrollView contentContainerStyle={currentStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder="First Name"
            placeholderTextColor="#c4c4c4"
            value={inputFname}
            onChangeText={setInputFname}
          />
        </View>
        <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder="Last Name"
            placeholderTextColor="#c4c4c4"
            value={inputLname}
            onChangeText={setInputLname}
          />
        </View>
        <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder="Email"
            placeholderTextColor="#c4c4c4"
            value={inputEmail}
            onChangeText={setInputEmail}
          />
        </View>
        <View style={currentStyles.inputContainer}>
          <TextInput
            secureTextEntry={true}
            style={currentStyles.input}
            placeholder="Password"
            placeholderTextColor="#c4c4c4"
            value={inputPassword}
            onChangeText={setInputPassword}
          /> 
        </View>
        <Pressable style={currentStyles.btn} onPress={() => handleRegister(inputFname, inputLname, inputEmail, inputPassword)}>
          <Text style={currentStyles.btnText}>Register</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const handleRegister = (fname, lname, email, password) => {
  console.log("handleRegister")
  console.log("First name: " + fname);
  console.log("Last name: " + lname);
  console.log("Email: " + email);
  console.log("Password: " + password);
  const url = 'http://localhost:3333/api/1.0.0/user';

  // handle login
  var validator = require("email-validator");
  console.log(("Email: " +validator.validate(email))); //true

  const pwRX = new RegExp("^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")
  console.log("Password: " + pwRX.test(password));
  //greater than 8 characters, including: one uppercase, one number and one special
  
  try{
    fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: fname.value,
          last_name: lname.value,
          email: email.value,
          password: password.value,
        }),
      });
  }
  catch (error){
    console.error(error);
  }

};

function SettingsScreen() {
  console.log("Settings")
  const { isDarkMode, setIsDarkMode, currentStyles } = useContext(ThemeContext);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={currentStyles.container}>
      <View style={currentStyles.titleContainer}>
        <Text style={currentStyles.whatsThat}>whatsThat</Text>
        <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
      </View>
      <Pressable  style={currentStyles.btn}  
      onPress={toggleDarkMode}>
        <Text>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
        </Pressable>
    </View>
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  console.log("HomeTabs")
  return (
    <Tab.Navigator
      screenOptions={{
        "tabBarActiveTintColor": "#4CAF50",
        "tabBarInactiveTintColor": "gray",
        "tabBarStyle": [
          {
            "display": "flex"
          },
          null
        ]
      }}
    >
      <Tab.Screen
        name="Login"
        component={LoginScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View>
              <Image
                source={require('./assets/home.png')}
                style={{ tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View>
              <Image
                source={require('./assets/settings.png')}
                style={{ tintColor: color }}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  console.log("App")
  return (
    <ThemeProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="Home"
            component={HomeTabs}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}


export default App;

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#3c3c3c',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 50,
    marginRight: 20,
    paddingHorizontal: 10,
    color: '#F5F5F5',
  },
  btn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  whatsThat: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  text: {
    color: '#F5F5F5',
    fontSize: 16,
    marginRight: 10,
  },
})


const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#008000',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 50,
    marginRight: 20,
    paddingHorizontal: 10,
    color: '#1c1c1c',
  },
  btn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom : 10,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  whatsThat: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  text: {
    color: '#1c1c1c',
    fontSize: 16,
    marginRight: 10,
  },
})
