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

// A higher-order component that provides theme context to its child components.
function ThemeProvider({ children }) {

  // Prints a debug message to the console when this component is rendered.
  console.debug("ThemeProvider")

  // Sets up state to track whether the user has enabled dark mode or not.
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Selects the appropriate styles based on whether the user has enabled dark mode or not.
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Provides the current theme context to its child components.
  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, currentStyles }}>
      {children}
    </ThemeContext.Provider>
  );
}

// A functional component that displays a single contact item in a list.
const ContactList = ({ navigation, title, id }) => {

  // Gets the current theme styles from the ThemeContext.
  const { currentStyles } = useContext(ThemeContext);

  // Logs the title and id of the current contact item to the console.
  console.log('title: ', title);
  console.log('id: ', id);

  // Renders the contact item with its title and a button to view its profile.
  return (
    <View style={currentStyles.lstItem}>
      <Text style={currentStyles.titleText}>{title}</Text>
      <TouchableOpacity style={currentStyles.btn} onPress={() => getProfile({ navigation }, id, 'Contact')}>
        <Text style={currentStyles.btnText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

// A functional component that displays a single chat item in a list.
const ChatList = ({ navigation, title, id }) => {

  // Gets the current theme styles from the ThemeContext.
  const { currentStyles } = useContext(ThemeContext);

  // Logs the title and id of the current chat item to the console.
  console.log('title: ', title);
  console.log('id: ', id);

  // Renders the chat item with its title and a button to view its chat screen.
  return (
    <View style={currentStyles.lstItem}>
      <Text style={currentStyles.titleText}>{title}</Text>
      <TouchableOpacity style={currentStyles.btn} onPress={() => getChat({ navigation }, id)}>
        <Text style={currentStyles.btnText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};


// An asynchronous function that retrieves the profile data for a given user ID and navigates to the appropriate screen.
const getProfile = async({ navigation }, id, screen) => {

  // Prints a debug message to the console when this function is called.
  console.debug("getProfile")

  // Logs the ID and screen parameters to the console.
  console.debug("ID: " + id);
  console.debug("screen: " + screen);

  // Retrieves the user's authentication token and ID from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');
  const userId = await AsyncStorage.getItem('id');

  try {

    // Sends a GET request to retrieve the user's profile data from the server.
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    // Sends a GET request to retrieve the user's profile picture from the server.
    const profilePic = await fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/photo`, {
      method: 'GET', 
      headers: {
        'Content-Type': 'image/png',
        'X-Authorization': token,
      },
    });

    // Converts the profile picture data to a blob and creates a URL for the image.
    const imageBlob = await profilePic.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    console.log("imageObjectURL: ", imageObjectURL);

    // Parses the JSON response from the server.
    const json = await response.json();
    console.log(json);

    // Navigates to the appropriate screen based on the user's ID and the screen parameter.
    if (userId == id)
    {
      navigation.navigate('Profile', {json: json, image: imageObjectURL});
    }
    else
    {
    navigation.navigate(screen, {json: json, image: imageObjectURL});
    }

  } catch (error) {

    // Logs an error message to the console if the data retrieval fails.
    console.error('Error fetching data:', error);

  }

};


// An asynchronous function that retrieves the chat data for a given chat ID and navigates to the Chat screen.
const getChat = async({ navigation }, id) => {

  // Prints a debug message to the console when this function is called.
  console.debug("getChat")

  // Logs the chat ID parameter to the console.
  console.debug("chat ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');

  try {

    // Sends a GET request to retrieve the chat data from the server.
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });
    
    // Parses the JSON response from the server.
    const json = await response.json();

    // Navigates to the Chat screen with the chat data and ID as parameters.
    navigation.navigate("Chat", {json: json, id: id});

  } catch (error) {

    // Logs an error message to the console if the data retrieval fails.
    console.error('Error fetching data:', error);

  }

};


// An asynchronous function that deletes a contact with the specified ID and updates the contact list.
const deleteContact = async({ navigation }, id) => {

  // Prints a debug message to the console when this function is called.
  console.debug("deleteContact")

  // Logs the ID parameter to the console.
  console.debug("ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');

  // Sends a DELETE request to delete the contact from the server.
  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/contact`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {

    // Checks the status code of the server response and displays an alert message accordingly.
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


// An asynchronous function that adds a new contact with the specified ID and updates the contact list.
const addContact = async({ navigation }, id) => {

  // Prints a debug message to the console when this function is called.
  console.debug("addContact")

  // Logs the ID parameter to the console.
  console.debug("ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');

  // Sends a POST request to add the contact to the server.
  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/contact`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {

    // Checks the status code of the server response and displays an alert message accordingly.
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


// An asynchronous function that adds a contact with the specified ID to the specified chat and updates the chat data.
const addContactToChat = async({ navigation }, id, chat_id) => {

  // Prints a debug message to the console when this function is called.
  console.debug("addContactToChat")

  // Logs the ID parameter to the console.
  console.debug("ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');

  // Sends a POST request to add the contact to the chat on the server.
  fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${chat_id}/user/${id}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {

    // Checks the status code of the server response and displays an alert message accordingly.
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


// An asynchronous function that removes a contact with the specified ID from the specified chat and updates the chat data.
const removeContactFromChat = async({ navigation }, id, chat_id) => {

  // Prints a debug message to the console when this function is called.
  console.debug("removeContactFromChat")

  // Logs the ID parameter to the console.
  console.debug("ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');
  const userId = await AsyncStorage.getItem('id');

  // Sends a DELETE request to remove the contact from the chat on the server.
  fetch(`http://192.168.1.245:3333/api/1.0.0/chat/${chat_id}/user/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {

    // Checks the status code of the server response and displays an alert message accordingly.
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

// An asynchronous function that sends a message to the specified chat and updates the chat data.
const postMessage = async({ navigation }, id, message) => {

  // Prints a debug message to the console when this function is called.
  console.debug("postMessage")

  // Logs the ID parameter to the console.
  console.debug("ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');

  // Sends a POST request to send the message to the chat on the server.
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

    // Checks the status code of the server response and displays an alert message accordingly.
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


// An asynchronous function that blocks a contact with the specified ID and updates the contact data.
const blockContact = async({ navigation }, id) => {

  // Prints a debug message to the console when this function is called.
  console.debug("blockContact")

  // Logs the ID parameter to the console.
  console.debug("ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');

  // Sends a POST request to block the contact on the server.
  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/block`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {

    // Checks the status code of the server response and displays an alert message accordingly.
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


// An asynchronous function that unblocks a contact with the specified ID and updates the contact data.
const unblockContact = async({ navigation }, id) => {

  // Prints a debug message to the console when this function is called.
  console.debug("unblockContact")

  // Logs the ID parameter to the console.
  console.debug("ID: " + id);

  // Retrieves the user's authentication token from AsyncStorage.
  const token = await AsyncStorage.getItem('x-authorization');

  // Sends a DELETE request to unblock the contact on the server.
  fetch(`http://192.168.1.245:3333/api/1.0.0/user/${id}/block`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then(async(response) => {

    // Checks the status code of the server response and displays an alert message accordingly.
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

  // Get the current theme from context
  const { isDarkMode, currentStyles } = useContext(ThemeContext);

  // Initialize state variables
  console.debug("LoginScreen")
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [message, setMessage] = useState('');

  // Handle user login
  const handleLogin = (email, password) => {
    console.debug("handleLogin")
    console.debug("Email: " + email);
    console.debug("Password: " + password);

    // Send login request to server
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
      
      // If login is successful, save token and navigate to HomeTabs screen
      if (response.status == 200) {
        const responseJson = await response.json();
        await AsyncStorage.setItem('x-authorization', responseJson.token);
        await AsyncStorage.setItem('id', JSON.stringify(responseJson.id));
        const id = await AsyncStorage.getItem('id');
        console.log("Setting ID at login. Value = " , id);
        console.log("Auth Token. Value = " , responseJson.token);
        setMessage('');
        setInputEmail('');
        setInputPassword('');
        navigation.navigate('HomeTabs');
      }
      // If login fails, show error message
      else if (response.status == 400) {
        console.log("Login details not recognised");
        setMessage(`Login details not recognised`);
      }
      // If server response is not successful, throw an error
      else {
        throw new Error('Server response not OK - ' + response.status); 
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  }
  // Render the LoginScreen UI
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

  // Initialize state variables
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputFname, setInputFname] = useState('');
  const [inputLname, setInputLname] = useState('');
  const [message, setMessage] = useState('');

  // Get the current theme from context
  const { isDarkMode, currentStyles } = useContext(ThemeContext);

  // Handle user register
  const handleRegister = (fname, lname, email, password) => {
    console.debug("handleRegister")
    console.debug("First name: " + fname);
    console.debug("Last name: " + lname);
    console.debug("Email: " + email);
    console.debug("Password: " + password);
    
    // Send register request to server
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

      // If register is successful, navigate to login screen
      if (response.status == 201) {
        Alert.alert('Alert', 'Registration Successful', 
        {text: 'OK'});
        navigation.navigate('Login');
      }
      // If register fails, show error message
      else if (response.status == 400) {
        console.log("Registration error - details not valid");
        setMessage(`Error - Email must be valid and password must be greater than 8 characters (including: one uppercase, one number and one special)`);
      }
      // If server response is not successful, throw an error
      else {
        throw new Error('Server response not OK - ' + response.status); 
      }
    })
    .catch((error) => {
      console.warn(error);
    })
  };

  // Render the RegisterScreen UI
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

// Asynchronously fetches the user's contacts from the server and navigates to the "My Contacts" screen
const getContacts = async({ navigation }) => {
  console.debug("getContacts")
  // Retrieves the user's authorization token from AsyncStorage
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    // Sends a GET request to the server to retrieve the user's contacts
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    // Parses the JSON response
    const json = await response.json();
    console.log('Contacts: ', json);

    // Navigates to the "My Contacts" screen and passes the retrieved contacts as a parameter
    navigation.navigate('My Contacts', {json})

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};

// An asynchronous function to fetch chats from the server and navigate to the 'My Chats' screen
const getChats = async({ navigation }) => {
  console.debug("getChats")

  // Get the user's authorization token from AsyncStorage
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    // Send a GET request to the server to fetch the chats using the authorization token
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/chat`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    // Parse the response as JSON
    const json = await response.json();

    // Log the retrieved chats and navigate to the 'My Chats' screen with the retrieved chats as a parameter
    console.log('Chats: ', json);
    navigation.navigate('My Chats', {json})

  } catch (error) {
    // Handle errors and log error messages
    console.error('Error fetching data:', error);
  }
};

// Asynchronously fetches the user's contacts from the server and returns the json
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

// Async function to check whether the user has any blocked contacts
const checkBlocked = async() => {
  console.debug("checkBlocked")

  // Get the user's authentication token from AsyncStorage
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    // Fetch the list of blocked contacts from the server
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/blocked`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    // Parse the response as JSON
    const json = await response.json();

    // Log the blocked contacts to the console for debugging purposes
    console.log('Blocked: ', json);

    // Return the list of blocked contacts
    return json;

  } catch (error) {
    // Log any errors that occur during the fetch operation
    console.error('Error fetching data:', error);
  }
};


//Fetches the list of blocked contacts from the server and navigates to the 'Blocked Contacts' screen.
const getBlockedContacts = async({ navigation }) => {
  console.debug("getContacts")

  // Retrieve the authentication token from AsyncStorage
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    // Fetch the list of blocked contacts from the server
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/blocked`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    const json = await response.json();
    console.log('Contacts: ', json);

    // Navigate to the 'Blocked Contacts' screen and pass the retrieved data as a parameter
    navigation.navigate('Blocked Contacts', {json})

  } catch (error) {
    // Log any errors that occur while fetching data
    console.error('Error fetching data:', error);
  }

};

//Fetches the list of users matching the search string from the server and navigates to the 'Users' screen.
const searchUsers = async({ navigation }, string, searchIn) => {
  console.debug("searchUsers")

  // get the user's authorization token
  const token = await AsyncStorage.getItem('x-authorization');

  try {
    // send a GET request to the server to search for users
    const response = await fetch(`http://192.168.1.245:3333/api/1.0.0/search?q=${string}&search_in=${searchIn}&limit=20&offset=0`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    });

    // convert the response to JSON
    const json = await response.json();
    console.log('Users: ', json);

    // navigate to the Search Results screen and pass the JSON data
    navigation.navigate('Search Results', {json})

  } catch (error) {
    console.error('Error fetching data:', error);
  }

};


// This is the HomeScreen component, which displays the main screen of the app
function HomeScreen({ navigation }) {
  console.debug("HomeScreen")
  
  // Get the current styles from the ThemeContext
  const { currentStyles } = useContext(ThemeContext);

  // Return a View component that contains the app title, logo, and two buttons
  return (
    <View style={currentStyles.container}>
      <View style={currentStyles.titleContainer}>
        <Text style={currentStyles.whatsThat}>whatsThat</Text>
        <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
      </View>

      {/* Button that navigates to the My Chats screen */}
      <Pressable style={currentStyles.btn} onPress={() => getChats({ navigation })}>
        <Text style={currentStyles.btnText}>My Chats</Text>
      </Pressable>

      {/* Button that navigates to the My Contacts screen */}
      <Pressable style={currentStyles.btn} onPress={() => getContacts({ navigation })}>
        <Text style={currentStyles.btnText}>My Contacts</Text>
      </Pressable>
    </View>
  );
};


function MyContactsScreen({ navigation, route }) {
  console.debug("MyContactsScreen")

  // Get the current styles and dark mode state from the ThemeContext
  const { currentStyles, isDarkMode } = useContext(ThemeContext);

  // Extract the JSON data passed from the previous screen through the navigation params
  const {json} = route.params;
  console.debug("json: " + json);

  // Set up state for the search bar
  const [searchTerm, setSearchTerm] = useState('');

  // Define the function to render each item in the FlatList
  const renderItem = ({ item }) => (
    <ContactList navigation={navigation} title={item.email} id={item.user_id}/>
  );

  return (
    // Main container view
    <View style={currentStyles.container}>

      {/* Button to view blocked users */}
      <Pressable style={currentStyles.btn}onPress={() => getBlockedContacts({ navigation })}>
        <Text style={currentStyles.btnText}>View Blocked Users</Text>
      </Pressable>

      {/* Search bar and button */}
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

      {/* FlatList to display the contacts */}
      <FlatList
        data={route.params.json}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id.toString()}
        style={currentStyles.list}
      />

    </View>
  );
};


// This component is responsible for rendering the list of user's chats
function MyChatsScreen({ navigation, route }) {
  console.debug("MyChatsScreen")

  // Extract styles and data from ThemeContext and route.params
  const { currentStyles } = useContext(ThemeContext);
  const { json } = route.params;

  console.debug("json: " + json);

  // Define a renderItem function to render each chat item
  const renderItem = ({ item }) => (
    <ChatList navigation={navigation} title={item.name} id={item.chat_id}/>
  );

  // Render the list of chats and a button to start a new chat
  return (
    <View style={currentStyles.container}>
      <View>
        <TouchableOpacity style={currentStyles.btn} onPress={() => navigation.navigate('Start Chat')}>
          <Text style={currentStyles.btnText}>Start New Chat</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={route.params.json}
        renderItem={renderItem}
        keyExtractor={(item) => item.chat_id.toString()}
        style={currentStyles.list}
      />
    </View>
  );
};


// A screen that displays a list of blocked contacts.
function BlockedContactsScreen({ navigation, route }) {
  console.debug("BlockedContactsScreen")
  
  // Get the current theme styles and blocked contacts data.
  const { currentStyles } = useContext(ThemeContext);
  const { json } = route.params;
  
  console.debug("json: " + json);
  
  // Render each blocked contact as a ContactList component.
  const renderItem = ({ item }) => (
    <ContactList navigation={navigation} title={item.email} id={item.user_id}/>
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


// A screen component that displays the search results for a user search
function SearchResultsScreen({ navigation, route }) {
  console.debug("SearchResultsScreen")

  // Get the current styles from the context and the JSON data from the route params
  const { currentStyles } = useContext(ThemeContext);
  const {json} = route.params;
  console.debug("json: " + json);
  
  // Define a renderItem function that renders a ContactList component for each item in the data array
  const renderItem = ({ item }) => (
    <ContactList navigation={navigation} title={item.given_name + ' ' + item.family_name} id={item.user_id}/>
  );

  // Render the component
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

// A screen component that displays another user as a contact
function ContactScreen({ route , navigation }) {
  console.debug("ContactScreen")

  // Initalise state variables
  const [contactExists, setContactExists] = useState(false);
  const [blockedExists, setBlockedExists] = useState(false);

  // Get the current styles from the context and the JSON data from the route params
  const { currentStyles } = useContext(ThemeContext);
  const {json, image} = route.params;
  console.debug("json: " + json);
  console.debug("image: " + image);

  // Parse the json into seperate componenets
  const { user_id, first_name, last_name, email } = json;

  useEffect(() => {
    const fetchData = async (userId) => {

      // Fetch Contacts and Blocked users
      const contacts =  await fetchContacts();
      const blocked =  await checkBlocked();

      // Cycles through Contacts, if they are a contact contactExists is set to true
      setContactExists(contacts.some(user => user.user_id === userId));

      // Cycles through Blocked users, if they are a blocked blockedExists is set to true
      setBlockedExists(blocked.some(user => user.user_id === userId));
      console.log("contactExists: ", contactExists)
    }
    fetchData(user_id);
  }, []);

  // Displays the UI for a blocked user
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
          {/* Button to unblock user */}
        <Pressable style={currentStyles.btn} onPress={() => unblockContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Unblock Contact</Text>
        </Pressable>
      </View>
    </View>
  );
  // Displays the UI for a contact
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
          {/* Button to delete contact */}
        <Pressable style={currentStyles.btn} onPress={() => deleteContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Delete Contact</Text>
        </Pressable>
        {/* Button to block contact */}
        <Pressable style={currentStyles.btn} onPress={() => blockContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Block Contact</Text>
        </Pressable>
      </View>
    </View>
  );
  // Displays the UI for a user who hasnt been added as a contact
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
          {/* Button to add contact */}
        <Pressable style={currentStyles.btn} onPress={() => addContact({ navigation }, user_id)}>
          <Text style={currentStyles.btnText}>Add as Contact</Text>
        </Pressable>
      </View>
    </View>
  );
};

function ChatScreen({ route, navigation }) {
  // Import styles from the current theme
  const { currentStyles } = useContext(ThemeContext);

  // Get the chat data and ID from the route params
  const { json, id } = route.params;

  // State variables for the input text, user ID, updated message, and selected message
  const [inputText, setInputText] = useState('');
  const [updatedMessage, setUpdatedMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Function to send a message
  const sendMessage = (string) => {
    // Reset the input text
    setInputText('');
    // Call the postMessage function to send the message
    postMessage({ navigation }, id, string);
  };

  // Function to format a timestamp as a string
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month+1} ${hours}:${minutes}`;
  };

  // Function to handle when a message is pressed
  const handlePressMessage = (message) => {
    // Set the selected message
    setSelectedMessage(message);
  };

  // Function to handle updating a message
  const handleUpdateMessage = async ({ navigation } , chat_id, message_id, newMessage) => {
    // Reset the selected message
    setSelectedMessage(null);
    console.debug("handleUpdateMessage")
    console.debug("chat_id: " + chat_id);
    console.debug("message_id: " + message_id);
    console.debug("newMessage: " + newMessage);

    // Get the user token from AsyncStorage
    const token = await AsyncStorage.getItem('x-authorization');

    // Make a PATCH request to update the message
    fetch(`http://192.168.1.245:3333/api/1.0.0//chat/${chat_id}/message/${message_id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
  
      body: JSON.stringify({
        message: newMessage,
      }),
    })
    .then((response) => {
      // If the server response is OK, reload the chat
      if (response.status == 200) {
        getChat({ navigation }, chat_id);
      } else {
        // If there is an error, display an alert and throw an error
        Alert.alert('Alert', 'Error', {text: 'OK'});
        throw new Error('Server response not OK - ' + response.status);
      }
    })
    .catch((error) => {
      // Log any errors that occur
      console.warn(error);
    });
  }

// Function to handle deleting a message from the chat
const handleDeleteMessage = async ({ navigation } , chat_id, message_id) => {
  console.debug("handleDeleteMessage")
  console.debug("chat_id: " + chat_id);
  console.debug("message_id: " + message_id);

  // Get token from AsyncStorage
  const token = await AsyncStorage.getItem('x-authorization');

  // Send DELETE request to API
  fetch(`http://192.168.1.245:3333/api/1.0.0//chat/${chat_id}/message/${message_id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
  })
  .then((response) => {
    if (response.status == 200) {
      // If successful, get updated chat data
      getChat({ navigation }, chat_id);
    } else {
      // If not successful, throw an error
      Alert.alert('Alert', 'Error', {text: 'OK'});
      throw new Error('Server response not OK - ' + response.status);
    }
  })
  .catch((error) => {
    console.warn(error);
  });
};

// Function to handle cancelling message update or deletion
const handleCancelMessage = () => {
  setSelectedMessage(null);
};

// Sorted messages oldest to newest
const sortedMessages = json.messages.slice().sort((a, b) => a.timestamp - b.timestamp);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={currentStyles.container}
    >
      {/* When title is pressed it navigates to the chat details page */}
      <TouchableOpacity onPress={() => navigation.navigate('Chat Details', {json, id})}>
        <Text style={currentStyles.title}>{json.name}</Text>
      </TouchableOpacity>
      {/* Flatlist to display messages */}
      <FlatList
        style={currentStyles.list}
        data={sortedMessages}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => handlePressMessage(item)}>
            <View style={currentStyles.messageContainer}>
              <Text style={currentStyles.authorName}>{item.author.first_name}</Text>
              <View style={currentStyles.message}>
                <Text style={currentStyles.messagetext}>{item.message}</Text>
              </View>
              <Text style={currentStyles.timestamp}>{formatDate(item.timestamp)}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={currentStyles.messageInputWrapper}
    >
      {/* Container for chat input */}
      <View style={currentStyles.inputMessageContainer}>
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
      {/* If a message is pressed, open the Update/Delete tab */}
      {selectedMessage && (
        <View style={currentStyles.inputMessageContainer}>
          <TouchableOpacity style={currentStyles.updateButton} onPress={() => handleUpdateMessage({ navigation }, id, selectedMessage.message_id, updatedMessage)}>
            <Text style={currentStyles.btnText}>Update</Text>
          </TouchableOpacity>
          <TextInput
            style={currentStyles.input}
            value={updatedMessage}
            onChangeText={setUpdatedMessage}
            placeholder="Enter update"
            placeholderTextColor={currentStyles.text.color}
          />
          <TouchableOpacity style={currentStyles.deleteButton}onPress={() => handleDeleteMessage({ navigation }, id, selectedMessage.message_id)}>
            <Text style={currentStyles.btnText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={currentStyles.cancelButton} onPress={handleCancelMessage}>
            <Text style={currentStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  </KeyboardAvoidingView>
);
};


// Screen component for adding contacts to a chat
function AddToChatScreen({ route , navigation }) {
  console.debug("AddToChatScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json, chat_id} = route.params;
  console.debug("contacts: " + json);

  // Function to render a contact in the list of contacts
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

// Screen component for displaying chat details, including chat members and the ability to remove them
function ChatDetailsScreen({ route , navigation }) {
  console.debug("ChatDetailsScreen")
  const { currentStyles } = useContext(ThemeContext);
  const {json, id} = route.params;
  console.debug("json: " + json);
  
  // Function for rendering a chat member item
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
  
  // Function to navigate to the Add To Chat screen with the contacts and chat_id as parameters
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

  // Get current theme styles from the context
  const { currentStyles } = useContext(ThemeContext);

  // Get the user JSON object and profile picture URI from the navigation route params
  const {json, image} = route.params;
  console.debug("json: " + json);
  console.debug("image: " + image);

  // Extract user information from the JSON object
  const { user_id, first_name, last_name, email } = json;

  // Function to upload the user's profile picture (not implemented)
  const uploadProfilePic = async (id) => {console.log("uploadProfilePic");}

  return (
      <View style={currentStyles.container}>
        <View style={currentStyles.titleContainer}>
          <Text style={currentStyles.whatsThat}>whatsThat</Text>
          <Image style={currentStyles.logo} source={require('./assets/logo.png')} />
        </View>
        <View style={currentStyles.profileContainer}>
          {/* Display the user's profile picture */}
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
          {/* Button to navigate to the Edit Profile screen */}
          <Pressable style={currentStyles.btn} onPress={() => navigation.navigate('Edit Profile', {json})}>
            <Text style={currentStyles.btnText}>Edit details</Text>
          </Pressable>
          {/* Button to upload a new profile picture (not implemented) */}
          <Pressable style={currentStyles.btn} onPress={() => uploadProfilePic(user_id)}>
            <Text style={currentStyles.btnText}>Upload profile picture</Text>
          </Pressable>
        </View>
      </View>
  );
};

// Screen component to allow user to edit chat name
function EditChatScreen({ route, navigation }) {
  console.debug("EditChatScreen")

  // Get current style theme and data from route params
  const { isDarkMode, currentStyles } = useContext(ThemeContext);
  const { json, id } = route.params;
  const [inputName, setInputName] = useState(json.name);

  // Function to edit chat name via API call
  const editChat = async(id, name) => {
    console.debug("editChat")
    console.debug("ID: " + id);
    console.debug("Name: " + name);

   // Get token from AsyncStorage
const token = await AsyncStorage.getItem('x-authorization');

// Send PATCH request to API
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
    // If successful, display confirmation alert and navigate back to Chats screen
    Alert.alert('Alert', 'Details Changed Successfully', {text: 'OK'});
    getChats({ navigation })
  } else {
    // If not successful, throw an error
    Alert.alert('Alert', 'Error', {text: 'OK'});
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
}

// Screen component to start a new chat with a given name
function StartChatScreen({ navigation }) {
  console.debug("StartChatScreen")
  const { isDarkMode, currentStyles } = useContext(ThemeContext);
  const [inputName, setInputName] = useState('');

  // Function to start a new chat with the given name
  const startChat = async(name) => {
    console.debug("startChat")
    const token = await AsyncStorage.getItem('x-authorization');
    
    fetch(`http://192.168.1.245:3333/api/1.0.0/chat`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        name: name
      }),
    })
    .then(async(response) => {
      
      if (response.status == 201) {
        Alert.alert('Alert', 'Chat started', 
          {text: 'OK'});
        getChats({ navigation })
      }
      else if (response.status == 400) {
        Alert.alert('Alert', 'Error', 
          {text: 'OK'});
          getChats({ navigation })
      }
      else {
        throw new Error('Server response not OK - ' + response.status); 
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  
  };

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
        <Pressable style={currentStyles.btn} onPress={() => startChat(inputName)}>
          <Text style={currentStyles.btnText}>Confirm</Text>
        </Pressable>
        </View>
      </View>
  );
}

function EditProfileScreen({ route, navigation }) {
  console.debug("EditProfileScreen")

  // Get the current style theme and user details from route parameters
  const { isDarkMode, currentStyles } = useContext(ThemeContext);
  const tempJson = route.params;
  const { json } = tempJson;
  const { user_id, first_name, last_name, email } = json;

  // Initialize state variables for input fields and error message
  const [inputEmail, setInputEmail] = useState(email);
  const [inputFname, setInputFname] = useState(first_name);
  const [inputLname, setInputLname] = useState(last_name);
  const [inputPassword, setInputPassword] = useState('');
  const [message, setMessage] = useState(null);

  // Function to send PATCH request to update user details
  const editProfile = async(id, fname, lname, email, password) => {
    console.debug("editProfile")
    console.debug("ID: " + id);
    console.debug("editProfile")
    console.debug("First name: " + fname);
    console.debug("Last name: " + lname);
    console.debug("Email: " + email);
    console.debug("Password: " + password);

    // Get the JWT token from AsyncStorage
    const token = await AsyncStorage.getItem('x-authorization');

    // Send PATCH request to API endpoint with updated user details
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
      // Handle server response
      if (response.status == 200) {
        Alert.alert('Alert', 'Details Changed Successfully', 
        {text: 'OK'});
        navigation.navigate("Settings")
      } else {
        // Display error message for invalid email/password format
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

  // get the current theme from the context
  const { isDarkMode, setIsDarkMode, currentStyles } = useContext(ThemeContext);

  // toggle the theme when the button is pressed
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // state to hold the user ID retrieved from AsyncStorage
  const [id, setID] = useState(null);
  // state to indicate if the data is being loaded from AsyncStorage
  const [loading, setLoading] = useState(true);

  // retrieve the user ID from AsyncStorage when the component mounts
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

  // handle the logout request
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
        // navigate back to the login screen after successful logout
        navigation.navigate('Login');
      } else {
        throw new Error('Server response not OK - ' + response.status);
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  };

  // render loading message while the user ID is being retrieved from AsyncStorage
  if(loading) return (
    <Text style={currentStyles.text}>Loading</Text>
  );
  // render error message if the user ID is not available
  if (!id) return (
    <Text style={currentStyles.text}>Data not available</Text>
  );

  // render the settings screen with toggle button for theme, buttons for profile and logout
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

// define a function that returns the home tab navigator
function HomeTabs() {
  console.debug("HomeTabs")

  // return the tab navigator with two screens: Home and Settings
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

// define the main App component
function App() {
  console.debug("App")

  // return the NavigationContainer component with the stack navigator
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
          <Stack.Screen name="Start Chat" component={StartChatScreen} />
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
  messageInputWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
    width: '100%',
  },
  inputMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    messageOptionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#1c1c1c',
    },
    updateButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    deleteButton: {
      backgroundColor: '#F44336',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    cancelButton: {
      backgroundColor: '#f5f5f5',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    cancelButtonText: {
      color: '#1c1c1c',
      fontWeight: 'bold',
      fontSize: 16,
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
  messageInputWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
    width: '100%',
  },
  inputMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  messageOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#1c1c1c',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

