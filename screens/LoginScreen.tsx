import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { supabase } from "../supabase/supabaseClient";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      navigation.navigate("Profile");
    }
  };

  return (
    <View style={{ flex:1, justifyContent:"center", padding:20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, marginBottom:10}} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} style={{borderWidth:1, marginBottom:10}} />
      <Button title="Entrar" onPress={handleLogin} />
      <Button title="Cadastrar" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}
