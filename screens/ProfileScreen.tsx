import { useEffect, useState } from "react";
import { View, TextInput, Button, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase/supabaseClient";
import { decode } from "base64-arraybuffer";

export default function ProfileScreen() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // carrega perfil existente
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setNome(data.name ?? "");
          setDescricao(data.description ?? "");
          setAvatar(data.avatar_url ?? null);
        }
      }
    };
    getUser();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64!;
      const fileName = `${userId}.png`;

      // upload no bucket
      const { error } = await supabase.storage
        .from("galeria")
        .upload(`profile/${fileName}`, decode(base64), {
          contentType: "image/png",
          upsert: true,
        });

      if (error) {
        Alert.alert("Erro", error.message);
      } else {
        const { data } = supabase.storage.from("galeria").getPublicUrl(`profile/${fileName}`);
        setAvatar(data.publicUrl);
      }
    }
  };

  const salvarPerfil = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, name: nome, description: descricao, avatar_url: avatar });

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Sucesso", "Perfil atualizado!");
    }
  };

  return (
    <View style={{ flex:1, justifyContent:"center", padding:20 }}>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={{borderWidth:1, marginBottom:10}} />
      <TextInput placeholder="Descrição" value={descricao} onChangeText={setDescricao} style={{borderWidth:1, marginBottom:10}} />
      {avatar && <Image source={{ uri: avatar }} style={{ width:100, height:100, borderRadius:50, marginBottom:10 }} />}
      <Button title="Selecionar Foto" onPress={pickImage} />
      <Button title="Salvar" onPress={salvarPerfil} />
    </View>
  );
}
