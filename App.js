import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useAsync } from 'react-async';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

function ThemeProvider({ children }) {
  console.debug("ThemeProvider")
  const [isDarkMode, setIsDarkMode] = useState(false);
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, currentStyles }}>
      {children}
    </ThemeContext.Provider>
  );
}

function LoginScreen({ navigation }) {
  console.debug("LoginScreen")
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const { currentStyles } = useContext(ThemeContext);

  const handleLogin = (email, password) => {
    console.debug("handleLogin")
    console.debug("Email: " + email);
    console.debug("Password: " + password);
  
    // handle login
    var validator = require("email-validator");
    console.debug((validator.validate(email))); //true
  
    const pwRX = new RegExp("^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")
    console.debug(pwRX.test(password));
    //greater than 8 characters, including: one uppercase, one number and one special
  
    fetch('http://192.168.1.245:3333/api/1.0.0/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then(async (responseJson) => {
      console.log(responseJson);

      // Store the token in AsyncStorage
      try {
        await AsyncStorage.setItem('x-authorization', responseJson.token);
        await AsyncStorage.setItem('id', JSON.stringify(responseJson.id));
        const id = await AsyncStorage.getItem('id');
        console.log("Setting ID at login. Value = " , id);
        navigation.navigate('HomeTabs');
      } catch (error) {
        console.warn('Error saving token:', error);
      }

      
    })
    .catch((error) => {
      console.warn(error);
    });
  
  };

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
    </ScrollView>
  );
};

function RegisterScreen ({navigation}) {
  console.debug("RegisterScreen")
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputFname, setInputFname] = useState('');
  const [inputLname, setInputLname] = useState('');
  const { currentStyles } = useContext(ThemeContext);

  const handleRegister = (fname, lname, email, password) => {
    console.debug("handleRegister")
    console.debug("First name: " + fname);
    console.debug("Last name: " + lname);
    console.debug("Email: " + email);
    console.debug("Password: " + password);
  
    // handle login
    var validator = require("email-validator");
    console.debug(("Email: " +validator.validate(email))); //true
  
    const pwRX = new RegExp("^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")
    console.debug("Password: " + pwRX.test(password));
    //greater than 8 characters, including: one uppercase, one number and one special
    
    fetch('http://192.168.1.245:3333/api/1.0.0/user', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
  
      body: JSON.stringify({
        first_name: fname,
        last_name: lname,
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //Showing response message coming from server 
        console.log(responseJson);
        Alert.alert('Alert', 'Registration Successful', 
        {text: 'OK'});
        navigation.navigate('Login');
  
      })
      .catch((error) => {
      //display error message
       console.warn(error);
      });
  
  };
  

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

function ChatsScreen() {
  console.debug("ChatScreen")
  const { currentStyles } = useContext(ThemeContext);
  const [id, setID] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await AsyncStorage.getItem('id');
      setID(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  console.log("Chatscreen id: ", id);

  if(loading) return (
    <Text style={currentStyles.text}>Loading</Text>
  );
  if (!id) return (
    <Text style={currentStyles.text}>Data not available</Text>
  );
  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <Text style={currentStyles.text}>You are logged in</Text>
        <Text style={currentStyles.text}> User ID: {id}</Text>
      </View>
  );
};

function ContactsScreen() {
  console.debug("ContactsScreen")
  const { currentStyles } = useContext(ThemeContext);

  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <Text style={currentStyles.text}>You are logged in</Text>
      </View>
  );
};

function ProfileScreen({ route , navigation }) {
  console.debug("ProfileScreen")
  const { currentStyles } = useContext(ThemeContext);
  const tempJson = route.params;
  const { json } = tempJson;
  const { user_id, first_name, last_name, email } = json;
  
  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
          <Image style={currentStyles.image} source={require('./assets/profile.png')} />
          <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>User ID:</Text>
            <Text style={currentStyles.text}>{user_id}</Text>
          </View>
          <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>First Name:</Text>
            <Text style={currentStyles.text}>{first_name}</Text>
          </View>
          <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>Last Name:</Text>
            <Text style={currentStyles.text}>{last_name}</Text>
          </View>
          <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>Email:</Text>
            <Text style={currentStyles.text}>{email}</Text>
          </View>
        </View>
        <View style={currentStyles.container}>
        <Pressable style={currentStyles.btn} onPress={() => navigation.navigate('Edit Profile', {json})}>
          <Text style={currentStyles.btnText}>Edit details</Text>
        </Pressable>
        <Pressable style={currentStyles.btn} onPress={() => console.log("Upload profile pic")}>
          <Text style={currentStyles.btnText}>Upload profile picture</Text>
        </Pressable>
      </View>
    </View>
  );
};

function EditProfileScreen({ route, navigation }) {
  console.debug("EditProfileScreen")
  const { currentStyles } = useContext(ThemeContext);
  const tempJson = route.params;
  const { json } = tempJson;
  const { user_id, first_name, last_name, email } = json;

  const [inputEmail, setInputEmail] = useState(email);
  const [inputFname, setInputFname] = useState(first_name);
  const [inputLname, setInputLname] = useState(last_name);
  const [inputPassword, setInputPassword] = useState('');

  const editProfile = async(id, fname, lname, email, password) => {
    console.debug("editProfile")
    console.debug("ID: " + id);
    console.debug("editProfile")
    console.debug("First name: " + fname);
    console.debug("Last name: " + lname);
    console.debug("Email: " + email);
    console.debug("Password: " + password);

    const token = await AsyncStorage.getItem('x-authorization');

    fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
  
      body: JSON.stringify({
        first_name: fname,
        last_name: lname,
        email: email,
        password: password,
      }),
    })
    .then((response) => {
      if (response.status == 200) {
        Alert.alert('Alert', 'Details Changed Successfully', 
        {text: 'OK'});
        navigation.navigate("Settings")
      } else {
        throw new Error('Server response not OK - ' + response.status);
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  }
  
  return (
      <View style={currentStyles.container}>
         <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
          <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder={inputEmail}
            placeholderTextColor="#c4c4c4"
            value={inputEmail}
            onChangeText={setInputEmail}
          />
          </View>
          <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder={inputFname}
            placeholderTextColor="#c4c4c4"
            value={inputFname}
            onChangeText={setInputFname}
          />
          </View>
          <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder={inputLname}
            placeholderTextColor="#c4c4c4"
            value={inputLname}
            onChangeText={setInputLname}
          />
          </View>
          <View style={currentStyles.inputContainer}>
        <TextInput
          secureTextEntry={true}
          style={currentStyles.input}
          placeholder=""
          placeholderTextColor="#c4c4c4"
          value={inputPassword}
          onChangeText={setInputPassword}
        /> 
      </View>
        </View>
        <View style={currentStyles.container}>
        <Pressable style={currentStyles.btn} onPress={() => editProfile(user_id, inputFname, inputLname, inputEmail, inputPassword)}>
          <Text style={currentStyles.btnText}>Confirm</Text>
        </Pressable>
        </View>
      </View>
  );
};

function SettingsScreen({ navigation }) {
  console.debug("Settings")
  const { isDarkMode, setIsDarkMode, currentStyles } = useContext(ThemeContext);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [id, setID] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await AsyncStorage.getItem('id');
      setID(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  console.log("SettingsScreen id: ", id);

  const getProfile = async(id) => {
    console.debug("getProfile")
    console.debug("ID: " + id);

    const token = await AsyncStorage.getItem('x-authorization');

    try {
      const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
      });
      const json = await response.json();
      console.log(json);
      navigation.navigate('Profile', {json});

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  
  };

  const handleLogout = async() => {
  
    const token = await AsyncStorage.getItem('x-authorization');
  
    console.log('Token for logout:', token);
  
    fetch('http://192.168.1.245:3333/api/1.0.0/logout', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-authorization': token,
      }
    })
    .then((response) => {
      if (response.status == 200) {
        navigation.navigate('Login');
      } else {
        throw new Error('Server response not OK - ' + response.status);
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  
  };

  if(loading) return (
    <Text style={currentStyles.text}>Loading</Text>
  );
  if (!id) return (
    <Text style={currentStyles.text}>Data not available</Text>
  );
  return (
    <View style={currentStyles.container}>
      <View style={currentStyles.titleContainer}>
        <Text style={currentStyles.whatsThat}>whatsThat</Text>
        <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
      </View>
      <Pressable  style={currentStyles.btn}  
      onPress={toggleDarkMode}>
        <Text style={currentStyles.btnText}>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
        </Pressable>
        <Pressable style={currentStyles.btn} onPress={() => getProfile(id)}>
          <Text style={currentStyles.btnText}>My Profile</Text>
        </Pressable>
        <Pressable style={currentStyles.btn} onPress={() => handleLogout()}>
          <Text style={currentStyles.btnText}>Log out</Text>
        </Pressable>
    </View>
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  console.debug("HomeTabs")
  return (
    <Tab.Navigator
      screenOptions={{
        "tabBarActiveTintColor": "white",
        "tabBarInactiveTintColor": "#3c3c3c",
        "tabBarStyle": [
          {
            "display": "flex"
          },
          null
        ]
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View>
              <Image
                source={require('./assets/chat.png')}
                style={{ tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View>
              <Image
                source={require('./assets/contacts.png')}
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
  console.debug("App")
  return (
    <ThemeProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="HomeTabs"
            component={HomeTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Edit Profile" component={EditProfileScreen} />
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
  scrollContainer: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 300,
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
  titleText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 10,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  image: {
    marginBottom: 10,
    width: 144,
    height: 144,
  },
})


const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 300,
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
  titleText: {
    color: '#1c1c1c',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  image: {
    marginBottom: 10,
    width: 144,
    height: 144,
  },
})
