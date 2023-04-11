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
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { SearchBar } from "react-native-elements";
import * as ImagePicker from 'expo-image-picker';
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


const ContactList = ({ navigation, title, id }) => {
  const { currentStyles } = useContext(ThemeContext);
  console.log('title: ', title);
  console.log('id: ', id);
  return (
    <View style={currentStyles.lstItem}>
      <Text style={currentStyles.titleText}>{title}</Text>
      <TouchableOpacity style={currentStyles.btn} onPress={() => getProfile({ navigation }, id, 'Contact')}>
        <Text style={currentStyles.btnText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

const ChatList = ({ navigation, title, id }) => {
  const { currentStyles } = useContext(ThemeContext);
  console.log('title: ', title);
  console.log('id: ', id);
  return (
    <View style={currentStyles.lstItem}>
      <Text style={currentStyles.titleText}>{title}</Text>
      <TouchableOpacity style={currentStyles.btn} onPress={() => getChat({ navigation }, id)}>
        <Text style={currentStyles.btnText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

const getProfile = async({ navigation }, id, screen) => {
  console.debug("getProfile")
  console.debug("ID: " + id);
  console.debug("screen: " + screen);

  const token = await AsyncStorage.getItem('x-authorization');
  const userId = await AsyncStorage.getItem('id');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });
    const profilePic = await fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/photo`, {
      method: 'GET', 
      headers: {
        'Content-Type': 'image/png',
        'X-Authorization': token,
      },
    });

    //console.log("profilePic: ", profilePic);
    const imageBlob = await profilePic.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    console.log("imageObjectURL: ", imageObjectURL);

    const json = await response.json();
    console.log(json);
    if (userId == id)
    {
      navigation.navigate('Profile', {json: json, image: imageObjectURL});
    }
    else
    {
    navigation.navigate(screen, {json: json, image: imageObjectURL});
    }

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

const getChat = async({ navigation }, id) => {
  console.debug("getChat")
  console.debug("chat ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });
    
    const json = await response.json();
    navigation.navigate("Chat", {json: json, id: id});

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

const deleteContact = async({ navigation }, id) => {
  console.debug("deleteContact")
  console.debug("ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');

  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/contact`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {
    
    if (response.status == 200) {
      Alert.alert('Alert', 'Contact Deleted', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else if (response.status == 400) {
      Alert.alert('Alert', 'Error whilst deleting', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}

const addContact = async({ navigation }, id) => {
  console.debug("addContact")
  console.debug("ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');

  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/contact`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {
    
    if (response.status == 200) {
      Alert.alert('Alert', 'Contact Added', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else if (response.status == 400) {
      Alert.alert('Alert', 'Error whilst adding', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}

const addContactToChat = async({ navigation }, id, chat_id) => {
  console.debug("addContactToChat")
  console.debug("ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');

  fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${chat_id}/user/${id}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {
    
    if (response.status == 200) {
      Alert.alert('Alert', 'Contact Added to chat', 
        {text: 'OK'});
      getChat({ navigation }, chat_id);
    }
    else if (response.status == 400) {
      Alert.alert('Alert', 'Already in chat', 
        {text: 'OK'});
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}

const removeContactFromChat = async({ navigation }, id, chat_id) => {
  console.debug("removeContactFromChat")
  console.debug("ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');
  const userId = await AsyncStorage.getItem('id');

  fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${chat_id}/user/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {
    
    if (response.status == 200) {
      if (userId == id)
      {
        Alert.alert('Alert', 'You have left the chat', 
        {text: 'OK'});
        getChats({ navigation })
      }
      else{
      Alert.alert('Alert', 'Contact removed from chat', 
        {text: 'OK'});
      getChat({ navigation }, chat_id);
    }
    }
    else if (response.status == 400) {
      Alert.alert('Alert', 'Error', 
        {text: 'OK'});
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}

const postMessage = async({ navigation }, id, message) => {
  console.debug("postMessage")
  console.debug("ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');

  fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${id}/message`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
    body: JSON.stringify({
      message: message,
    }),
  })
  .then(async(response) => {
    
    if (response.status == 200) {
      getChat({ navigation }, id);
    }
    else if (response.status == 400) {
      Alert.alert('Alert', 'Error whilst sending', 
        {text: 'OK'});
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}

const blockContact = async({ navigation }, id) => {
  console.debug("blockContact")
  console.debug("ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');

  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/block`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {
    
    if (response.status == 200) {
      Alert.alert('Alert', 'Contact blocked', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else if (response.status == 400) {
      Alert.alert('Alert', 'Error whilst blocking', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}

const unblockContact = async({ navigation }, id) => {
  console.debug("blockContact")
  console.debug("ID: " + id);

  const token = await AsyncStorage.getItem('x-authorization');

  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/block`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {
    
    if (response.status == 200) {
      Alert.alert('Alert', 'Contact unblocked', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else if (response.status == 400) {
      Alert.alert('Alert', 'Error whilst unblocking', 
        {text: 'OK'});
      getContacts({ navigation })
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}

function LoginScreen({ navigation }) {

  const { isDarkMode, currentStyles } = useContext(ThemeContext);

  console.debug("LoginScreen")
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [message, setMessage] = useState('');

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
  .then(async(response) => {
    
    if (response.status == 200) {
      const responseJson = await response.json();
      await AsyncStorage.setItem('x-authorization', responseJson.token);
      await AsyncStorage.setItem('id', JSON.stringify(responseJson.id));
      const id = await AsyncStorage.getItem('id');
      console.log("Setting ID at login. Value = " , id);
      console.log("Auth Token. Value = " , responseJson.token);
      navigation.navigate('HomeTabs');
    }
    else if (response.status == 400) {
      console.log("Login details not recognised");
      setMessage(`Login details not recognised`);
    }
    else {
      throw new Error('Server response not OK - ' + response.status); 
    }
  })
  .catch((error) => {
    console.warn(error);
  });
}
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
          placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
          value={inputEmail}
          onChangeText={setInputEmail}
        />
      </View>
      <View style={currentStyles.inputContainer}>
        <TextInput
          secureTextEntry={true}
          style={currentStyles.input}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
          value={inputPassword}
          onChangeText={setInputPassword}
        /> 
      </View>
      {message && (
  <View style={currentStyles.errorMessageContainer}>
    <Text style={currentStyles.errorMessage}>{message}</Text>
  </View>
)}
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
  const { isDarkMode, currentStyles } = useContext(ThemeContext);
  const [message, setMessage] = useState('');

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
    .then(async(response) => {
      if (response.status == 200) {
        Alert.alert('Alert', 'Registration Successful', 
        {text: 'OK'});
        navigation.navigate('Login');
      }
      else if (response.status == 400) {
        console.log("Registration error - details not valid");
        setMessage(`Error - Email must be valid and password must be greater than 8 characters (including: one uppercase, one number and one special)`);
      }
      else {
        throw new Error('Server response not OK - ' + response.status); 
      }
    })
    .catch((error) => {
      console.warn(error);
    })
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
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputFname}
            onChangeText={setInputFname}
          />
        </View>
        <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder="Last Name"
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputLname}
            onChangeText={setInputLname}
          />
        </View>
        <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder="Email"
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputEmail}
            onChangeText={setInputEmail}
          />
        </View>
        <View style={currentStyles.inputContainer}>
          <TextInput
            secureTextEntry={true}
            style={currentStyles.input}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputPassword}
            onChangeText={setInputPassword}
          /> 
        </View>
        <Pressable style={currentStyles.btn} onPress={() => handleRegister(inputFname, inputLname, inputEmail, inputPassword)}>
          <Text style={currentStyles.btnText}>Register</Text>
        </Pressable>
      </View>
      {message && (
  <View style={currentStyles.errorMessageContainer}>
    <Text style={currentStyles.errorMessage}>{message}</Text>
  </View>
)}
    </ScrollView>
  );
};

const getContacts = async({ navigation }) => {
  console.debug("getContacts")
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    const json = await response.json();
    console.log('Contacts: ', json);
    navigation.navigate('My Contacts', {json})

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

const getChats = async({ navigation }) => {
  console.debug("getChats")
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/chat`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    const json = await response.json();
    console.log('Chats: ', json);
    navigation.navigate('My Chats', {json})

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

const fetchContacts = async() => {
  console.debug("fetchContacts")
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    const json = await response.json();
    console.log('Contacts: ', json);
    return json;

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

const checkBlocked = async() => {
  console.debug("checkBlocked")
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/blocked`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    const json = await response.json();
    console.log('Blocked: ', json);
    return json;

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

const getBlockedContacts = async({ navigation }) => {
  console.debug("getContacts")
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/blocked`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    const json = await response.json();
    console.log('Contacts: ', json);
    navigation.navigate('Blocked Contacts', {json})

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

const searchUsers = async({ navigation }, string, searchIn) => {
  console.debug("searchUsers")
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/search?q=${string}&search_in=${searchIn}&limit=20&offset=0`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    const json = await response.json();
    console.log('Users: ', json);
    navigation.navigate('Search Results', {json})

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

function HomeScreen({ navigation }) {
  console.debug("HomeScreen")
  const { currentStyles } = useContext(ThemeContext);

  return (
    <View style={currentStyles.container}>
    <View style={currentStyles.titleContainer}>
      <Text style={currentStyles.whatsThat}>whatsThat</Text>
      <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
    </View>
    <Pressable style={currentStyles.btn} onPress={() => getChats({ navigation })}>
        <Text style={currentStyles.btnText}>My Chats</Text>
      </Pressable>
      <Pressable style={currentStyles.btn} onPress={() => getContacts({ navigation })}>
        <Text style={currentStyles.btnText}>My Contacts</Text>
      </Pressable>
  </View>
  );
};

function MyContactsScreen({ navigation, route }) {
  console.debug("MyContactsScreen")
  const { currentStyles, isDarkMode } = useContext(ThemeContext);
  const {json} = route.params;
  console.debug("json: " + json);
  const [searchTerm, setSearchTerm] = useState('');
  
  const renderItem = ({ item }) => (
    <ContactList navigation={navigation} title={item.first_name + ' ' + item.last_name} id={item.user_id}/>
  );

  return (
    <View style={currentStyles.container}>
      <Pressable style={currentStyles.btn}onPress={() => getBlockedContacts({ navigation })}>
          <Text style={currentStyles.btnText}>View Blocked Users</Text>
        </Pressable>
      <View style={currentStyles.searchBarContainer}>
        <TextInput
          style={currentStyles.input}
          placeholder="Search all users"
          placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
         <Pressable style={currentStyles.btn}onPress={() => searchUsers({ navigation }, searchTerm, 'all')}>
          <Text style={currentStyles.btnText}>Search</Text>
        </Pressable>
      </View>
      <FlatList
        data={route.params.json}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id.toString()}
        style={currentStyles.list}
      />
    </View>
  );
};

function MyChatsScreen({ navigation, route }) {
  console.debug("MyChatsScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json} = route.params;
  console.debug("json: " + json);
  
  const renderItem = ({ item }) => (
    <ChatList navigation={navigation} title={item.name} id={item.chat_id}/>
  );

  return (
    <View style={currentStyles.container}>
      <FlatList
        data={route.params.json}
        renderItem={renderItem}
        keyExtractor={(item) => item.chat_id.toString()}
        style={currentStyles.list}
      />
    </View>
  );
};

function BlockedContactsScreen({ navigation, route }) {
  console.debug("BlockedContactsScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json} = route.params;
  console.debug("json: " + json);
  
  const renderItem = ({ item }) => (
    <ContactList navigation={navigation} title={item.first_name + ' ' + item.last_name} id={item.user_id}/>
  );

  return (
    <View style={currentStyles.container}>
      <FlatList
        data={route.params.json}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id.toString()}
        style={currentStyles.list}
      />
    </View>
  );
};

function SearchResultsScreen({ navigation, route }) {
  console.debug("SearchResultsScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json} = route.params;
  console.debug("json: " + json);
  
  const renderItem = ({ item }) => (
    <ContactList navigation={navigation} title={item.given_name + ' ' + item.family_name} id={item.user_id}/>
  );

  return (
    <View style={currentStyles.container}>
      <FlatList
        data={route.params.json}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id.toString()}
        style={currentStyles.list}
      />
    </View>
  );
};

function ContactScreen({ route , navigation }) {
  console.debug("ContactScreen")
  const [contactExists, setContactExists] = useState(false);
  const [blockedExists, setBlockedExists] = useState(false);
  const { currentStyles } = useContext(ThemeContext);
  const {json, image} = route.params;
  console.debug("json: " + json);
  console.debug("image: " + image);
  const { user_id, first_name, last_name, email } = json;

  useEffect(() => {
    const fetchData = async (userId) => {
      const contacts =  await fetchContacts();
      const blocked =  await checkBlocked();
      setContactExists(contacts.some(user => user.user_id === userId));
      setBlockedExists(blocked.some(user => user.user_id === userId));
      console.log("contactExists: ", contactExists)
    }
    fetchData(user_id);
  }, []);

  if(blockedExists) return (
    <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
        <Image source={{ uri: image }} style={currentStyles.image} />
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
        <Pressable style={currentStyles.btn} onPress={() => unblockContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Unblock Contact</Text>
        </Pressable>
      </View>
    </View>
  );
  if(contactExists) return (
    <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
        <Image source={{ uri: image }} style={currentStyles.image} />
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
        <Pressable style={currentStyles.btn} onPress={() => deleteContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Delete Contact</Text>
        </Pressable>
        <Pressable style={currentStyles.btn} onPress={() => blockContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Block Contact</Text>
        </Pressable>
      </View>
    </View>
  );
  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
        <Image source={{ uri: image }} style={currentStyles.image} />
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
        <Pressable style={currentStyles.btn} onPress={() => addContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Add as Contact</Text>
        </Pressable>
      </View>
    </View>
  );
};

function ChatScreen({ route, navigation }) {
  console.debug('ChatScreen');
  const { currentStyles } = useContext(ThemeContext);
  const { json, id } = route.params;
  const [inputText, setInputText] = useState('');
  const [userID, setuserID] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem('id');
      setuserID(id);
    }
    fetchData();
  }, []);

  

  console.log("json: ", json)
  console.log("chat id: ", id)
  console.log("user id: ", userID)

  const sendMessage = (string) => {
    setInputText('');
    postMessage({ navigation }, id, string);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month+1} ${hours}:${minutes}`;
  };

  // Sort messages by timestamp in ascending order
const sortedMessages = json.messages.slice().sort((a, b) => a.timestamp - b.timestamp);


return (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={currentStyles.container}
  >
    <TouchableOpacity onPress={() => navigation.navigate('Chat Details', {json, id})}>
        <Text style={currentStyles.title}>{json.name}</Text>
      </TouchableOpacity>
    <FlatList
      style={currentStyles.list}
      data={sortedMessages}
      renderItem={({ item, index }) => (
        <View
          style={currentStyles.messageContainer}
        >
          <Text style={currentStyles.authorName}>{item.author.first_name}</Text>
          <View style={currentStyles.message}>
            <Text style={currentStyles.messagetext}>{item.message}</Text>
          </View>
          <Text style={currentStyles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
    <View style={currentStyles.inputMesageContainer}>
      <TextInput
        style={currentStyles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type your message"
        placeholderTextColor={currentStyles.text.color}
      />
      <TouchableOpacity style={currentStyles.btnSend} onPress={() => sendMessage(inputText)}>
        <Text style={currentStyles.btnText}>Send</Text>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
);
}

function AddToChatScreen({ route , navigation }) {
  console.debug("AddToChatScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json, chat_id} = route.params;
  console.debug("contacts: " + json);

  const renderContact = ({ item }) => (
    <View style={currentStyles.contactContainer}>
      <TouchableOpacity
        style={currentStyles.addButton}
        onPress={() => addContactToChat({ navigation }, item.user_id, chat_id)}
      >
        <Text style={currentStyles.addButtonText}>Add</Text>
      </TouchableOpacity>
      <Text style={currentStyles.contactText}>{item.email}</Text>
      
    </View>
  );

  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>Contacts:</Text>
          </View>
          <FlatList
            data={json}
            renderItem={renderContact}
            keyExtractor={item => item.user_id}
          />
      </View>
  );
};

function ChatDetailsScreen({ route , navigation }) {
  console.debug("ChatDetailsScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json, id} = route.params;
  console.debug("json: " + json);
  
  const renderMember = ({ item }) => (
    <View style={currentStyles.contactContainer}>
      <TouchableOpacity
        style={currentStyles.addButton}
        onPress={() => removeContactFromChat({ navigation }, item.user_id, id)}
      >
        <Text style={currentStyles.addButtonText}>Remove</Text>
      </TouchableOpacity>
      <Text style={currentStyles.contactText}>{item.email}</Text>
      
    </View>
  );

  const addToChat = async () => {
    const contacts = await fetchContacts();
    console.log(contacts);
    navigation.navigate('Add To Chat', {json: contacts, chat_id: id});
  };

  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
          <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>Chat name:</Text>
            <Text style={currentStyles.text}>{json.name}</Text>
          </View>
          <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>Creator email:</Text>
            <Text style={currentStyles.text}>{json.creator.email}</Text>
          </View>
          <View style={currentStyles.userInfo}>
            <Text style={currentStyles.titleText}>Members:</Text>
          </View>
          <FlatList
            data={json.members}
            renderItem={renderMember}
            keyExtractor={item => item.id}
          />
        </View>
        <TouchableOpacity style={currentStyles.btn} onPress={() =>  navigation.navigate('Edit Chat', {json: json, id: id})}>
        <Text style={currentStyles.btnText}>Edit Chat Name</Text>
      </TouchableOpacity>
        <TouchableOpacity style={currentStyles.btn} onPress={() => addToChat()}>
        <Text style={currentStyles.btnText}>Add Contacts to chat</Text>
      </TouchableOpacity>
      </View>
  );
};


function ProfileScreen({ route , navigation }) {
  console.debug("ProfileScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json, image} = route.params;
  console.debug("json: " + json);
  console.debug("image: " + image);
  const { user_id, first_name, last_name, email } = json;
  
  const uploadProfilePic = async (id) => {console.log("uploadProfilePic");}

  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
        <Image source={{ uri: image }} style={currentStyles.image} />
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
        <Pressable style={currentStyles.btn} onPress={() => uploadProfilePic(user_id)}>
          <Text style={currentStyles.btnText}>Upload profile picture</Text>
        </Pressable>
      </View>
    </View>
  );
};

function EditChatScreen({ route, navigation }) {
  console.debug("EditChatScreen")
  const { isDarkMode, currentStyles } = useContext(ThemeContext);
  const { json, id } = route.params;
  const [inputName, setInputName] = useState(json.name);

  const editChat = async(id, name) => {
    console.debug("editChat")
    console.debug("ID: " + id);
    console.debug("Name: " + name);

    const token = await AsyncStorage.getItem('x-authorization');

    fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
  
      body: JSON.stringify({
        name: name,
      }),
    })
    .then((response) => {
      if (response.status == 200) {
        Alert.alert('Alert', 'Details Changed Successfully', 
        {text: 'OK'});
        getChats({ navigation })
      } else {
        Alert.alert('Alert', 'Error', 
        {text: 'OK'});
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
            placeholder={inputName}
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputName}
            onChangeText={setInputName}
          />
          </View>
        </View>
        <View style={currentStyles.container}>
        <Pressable style={currentStyles.btn} onPress={() => editChat(id, inputName)}>
          <Text style={currentStyles.btnText}>Confirm</Text>
        </Pressable>
        </View>
      </View>
  );
};

function EditProfileScreen({ route, navigation }) {
  console.debug("EditProfileScreen")
  const { isDarkMode, currentStyles } = useContext(ThemeContext);
  const tempJson = route.params;
  const { json } = tempJson;
  const { user_id, first_name, last_name, email } = json;

  const [inputEmail, setInputEmail] = useState(email);
  const [inputFname, setInputFname] = useState(first_name);
  const [inputLname, setInputLname] = useState(last_name);
  const [inputPassword, setInputPassword] = useState('');
  const [message, setMessage] = useState(null);

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
        setMessage(`Error: Email must be valid and password must be greater than 8 characters (including: one uppercase, one number and one special)`);
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
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputEmail}
            onChangeText={setInputEmail}
          />
          </View>
          <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder={inputFname}
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputFname}
            onChangeText={setInputFname}
          />
          </View>
          <View style={currentStyles.inputContainer}>
          <TextInput
            style={currentStyles.input}
            placeholder={inputLname}
            placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
            value={inputLname}
            onChangeText={setInputLname}
          />
          </View>
          <View style={currentStyles.inputContainer}>
        <TextInput
          secureTextEntry={true}
          style={currentStyles.input}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#F5F5F5' : '#c4c4c4'}
          value={inputPassword}
          onChangeText={setInputPassword}
        /> 
      </View>
      {message && (
  <View style={currentStyles.errorMessageContainer}>
    <Text style={currentStyles.errorMessage}>{message}</Text>
  </View>
)}
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
        <Pressable style={currentStyles.btn} onPress={() =>  getProfile({ navigation }, id, 'Profile')}>
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
    initialRouteName="Home"
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
        name="Home"
        component={HomeScreen}
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
          <Stack.Screen name="My Contacts" component={MyContactsScreen} />
          <Stack.Screen name="My Chats" component={MyChatsScreen} />
          <Stack.Screen name="Blocked Contacts" component={BlockedContactsScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Edit Profile" component={EditProfileScreen} />
          <Stack.Screen name="Search Results" component={SearchResultsScreen} />
          <Stack.Screen name="Chat Details" component={ChatDetailsScreen} />
          <Stack.Screen name="Add To Chat" component={AddToChatScreen} />
          <Stack.Screen name="Edit Chat" component={EditChatScreen} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#ffffff',
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
    borderColor: '#f5f5f5',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  inputMesageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 100,
    marginTop: 10,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#3c3c3c',
    borderColor: '#f5f5f5',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  input: {
    color: 'white',
    flex: 1,
    height: 50,
    marginRight: 20,
    paddingHorizontal: 10,
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
  btnSend: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
  messagetext: {
    color: '#1c1c1c',
    fontSize: 16,
    marginRight: 10,
  },
  titleText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
    fontSize: 16,
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
  errorMessageContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
  },
  lstItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  list: {
  flex: 1,
  width: '100%',
  paddingHorizontal: 20,
  },
  searchBarContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
  },
  searchBarInput: {
  flex: 1,
  height: 40,
  borderWidth: 1,
  borderColor: 'white',
  marginRight: 10,
  paddingHorizontal: 10,
  color: '#F5F5F5',
  },
  messageContainer: {
  flexDirection: 'column',
  marginBottom: 10,
  alignSelf: 'flex-start',
  },
  message: {
  backgroundColor: '#DCF8C6',
  borderRadius: 5,
  paddingHorizontal: 10,
  paddingVertical: 5,
  maxWidth: '80%',
  },
  timestamp: {
  fontSize: 12,
  color: 'gray',
  marginLeft: 5,
  marginTop: 2,
  },
  authorName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#F5F5F5',
    },
    contactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 10,
      paddingHorizontal: 20,
      width: '100%',
      minWidth: 350,
    },
    contactText: {
      color: '#F5F5F5',
      fontSize: 18,
      fontWeight: 'bold',
    },
    addButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });


const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
    borderColor: '#3c3c3c',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  inputMesageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 100,
    marginTop: 10,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderColor: '#3c3c3c',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  input: {
    color: 'black',
    flex: 1,
    height: 50,
    marginRight: 20,
    paddingHorizontal: 10,
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
  btnSend: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
  messagetext: {
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
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#1c1c1c',
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
  errorMessageContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
  },
  lstItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  list: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  searchBarInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
    paddingHorizontal: 10,
    color: '#3c3c3c',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1c1c1c',
    padding: 10,
  },
  messageContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  message: {
    backgroundColor: '#DCF8C6',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '80%',
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 5,
    marginTop: 2,
  },
  authorName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1c1c1c',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 20,
    width: '50%',
    minWidth: 350,
  },
  contactText: {
      color: '#1c1c1c',
      fontSize: 18,
      fontWeight: 'bold',
  },
  addButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
  },
  addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
  },
})

