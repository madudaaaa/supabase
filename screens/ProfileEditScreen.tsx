import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase/supabaseClient";
import { decode } from "base64-arraybuffer";

export default function ProfileEditScreen({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
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
    if (!userId) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permissão", "Precisamos de permissão para acessar suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert("Erro", "Não foi possível ler a imagem selecionada.");
      return;
    }

    setLoading(true);
    try {
      const fileName = `${userId}.png`;
      const path = `profile/${fileName}`;
      const contentType = asset.mimeType ?? "image/png";
      const fileBuffer = decode(asset.base64);

      const { error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(path, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("galeria").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?cache=${Date.now()}`;

      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({ id: userId, name: nome, description: descricao, avatar_url: publicUrl }, { returning: "minimal" });

      if (dbError) throw dbError;

      setAvatar(publicUrl);
      Alert.alert("Sucesso", "Foto enviada e perfil atualizado!");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err?.message ?? "Erro ao enviar a imagem");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async () => {
    if (!userId) return;
    Alert.alert("Confirmar", "Excluir foto de perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            const path = `profile/${userId}.png`;
            const { error: removeError } = await supabase.storage.from("galeria").remove([path]);
            if (removeError) throw removeError;

            const { error: dbError } = await supabase
              .from("profiles")
              .upsert({ id: userId, avatar_url: null }, { returning: "minimal" });

            if (dbError) throw dbError;

            setAvatar(null);
            Alert.alert("Sucesso", "Foto removida.");
          } catch (err: any) {
            console.error(err);
            Alert.alert("Erro", err?.message ?? "Erro ao remover a imagem");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const salvarPerfil = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, name: nome, description: descricao, avatar_url: avatar }, { returning: "minimal" });

      if (error) throw error;
      Alert.alert("Sucesso", "Perfil atualizado!");
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err?.message ?? "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const excluirConta = async () => {
    Alert.alert("Confirmar", "Tem certeza que deseja excluir a conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          if (!userId) return;
          setLoading(true);
          try {
           
            await supabase.from("profiles").delete().eq("id", userId);
           
            await supabase.storage.from("galeria").remove([`profile/${userId}.png`]);
         
            await supabase.auth.signOut();
            Alert.alert("Conta excluída");
            navigation.navigate("Login");
          } catch (err: any) {
            console.error(err);
            Alert.alert("Erro", err?.message ?? "Erro ao excluir conta");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={{ color: "#666" }}>Sem foto</Text>
        </View>
      )}

      <View style={{ width: "100%", marginVertical: 8 }}>
        <Button title="Trocar foto" onPress={pickImage} disabled={loading} />
      </View>

      {avatar && (
        <View style={{ width: "100%", marginBottom: 8 }}>
          <Button title="Excluir foto" color="red" onPress={deleteImage} disabled={loading} />
        </View>
      )}

      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <View style={{ width: "100%", marginTop: 6 }}>
        <Button title="Salvar" onPress={salvarPerfil} disabled={loading} />
      </View>

      <View style={{ width: "100%", marginTop: 12 }}>
        <Button title="Excluir conta" color="red" onPress={excluirConta} disabled={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  avatarPlaceholder: { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },
});