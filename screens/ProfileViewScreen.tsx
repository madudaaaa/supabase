import { useEffect, useState } from "react";
import { View, Text, Image, Button, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../supabase/supabaseClient";
import { useIsFocused } from "@react-navigation/native";

export default function ProfileViewScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadProfile();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Nenhum perfil encontrado</Text>
        <Button title="Criar Perfil" onPress={() => navigation.navigate("ProfileEdit")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={{ color: "#888" }}>Sem foto</Text>
        </View>
      )}
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.desc}>{profile.description}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Editar perfil" onPress={() => navigation.navigate("ProfileEdit")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  avatarPlaceholder: { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  desc: { fontSize: 16, color: "#666", textAlign: "center", paddingHorizontal: 20 },
});