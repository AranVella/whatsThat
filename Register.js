import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';

export default function App() {
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputFname, setInputFname] = useState('');
  const [inputLname, setInputLname] = useState('');

  const handleLogin = () => {
    // handle login
    navigation.navigate('App');
  };

  const handleRegister = () => {
    // handle register

  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.whatsThat}>whatsThat</Text>
        <Image style={styles.logo} source={require('./logo.png')} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#c4c4c4"
          value={inputEmail}
          onChangeText={setInputEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#c4c4c4"
          value={inputPassword}
          onChangeText={setInputPassword}
        /> 
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={handleRegister}>
        <Text style={styles.loginBtnText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerText} onPress={handleLogin}>
        <Text style={styles.registerBtnText}>Do have an account? Login here.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  loginBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    marginTop: 20,
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerBtnText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
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
  }
});