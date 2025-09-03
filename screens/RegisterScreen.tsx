import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { supabase } from "../supabase/supabaseClient";

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password: senha });
    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Sucesso", "Cadastro realizado!");
      navigation.navigate("Login");
    }
  };

  return (
    <View style={{ flex:1, justifyContent:"center", padding:20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, marginBottom:10}} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} style={{borderWidth:1, marginBottom:10}} />
      <Button title="Cadastrar" onPress={handleRegister} />
    </View>
  );
}
