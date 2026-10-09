
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

const INITIAL_TEAMS = [
  { id: "1", name: "LOS RUFOS FC", owner: "David" },
  { id: "2", name: "Sirplayers", owner: "Jonni" },
  { id: "3", name: "DMALAMANERA FC", owner: "Ayoze" },
  { id: "4", name: "LYON FC", owner: "Aytami" },
  { id: "5", name: "MachinTeam", owner: "Edu" },
  { id: "6", name: "Sin nombre - Namy", owner: "Namy" },
  { id: "7", name: "KR BABY", owner: "Pipe" },
  { id: "8", name: "Guargacho FC", owner: "Damian" },
  { id: "9", name: "Sin nombre - Khaled", owner: "Khaled" },
  { id: "10", name: "Médano FC", owner: "Carlis" },
];

const makeTeams = () =>
  INITIAL_TEAMS.map((team) => ({
    ...team,
    points: 0,
    coins: 0,
    players: [],
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
  }));

const initialTabs = [
  "Liga",
  "Partidos",
  "Draft",
  "Plantillas",
  "Mercado",
  "Admin",
];

export default function App() {
  const [teams, setTeams] = useState(makeTeams);
  const [tab, setTab] = useState("Liga");
  const [matches, setMatches] = useState([]);
  const [currentRound, setCurrentRound] = useState("1");
  const [marketRound, setMarketRound] = useState(0);
  const [signings, setSignings] = useState({});
  const [draftOrder, setDraftOrder] = useState([]);
  const [draftPick, setDraftPick] = useState(0);
  const [draftStarted, setDraftStarted] = useState(false);
  const [incidents, setIncidents] = useState([]);

  const [homeId, setHomeId] = useState("1");
  const [awayId, setAwayId] = useState("2");
  const [homeGoals, setHomeGoals] = useState("0");
  const [awayGoals, setAwayGoals] = useState("0");

  const [selectedTeam, setSelectedTeam] = useState("1");
  const [playerName, setPlayerName] = useState("");
  const [playerRating, setPlayerRating] = useState("");
  const [marketTeam, setMarketTeam] = useState("1");
  const [marketPlayer, setMarketPlayer] = useState("");
  const [marketRating, setMarketRating] = useState("");
  const [releaseName, setReleaseName] = useState("");

  const [newTeamName, setNewTeamName] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [incidentText, setIncidentText] = useState("");

  const findTeam = (id) => teams.find((team) => team.id === id);

  const updateTeam = (id, changes) => {
    setTeams((oldTeams) =>
      oldTeams.map((team) =>
        team.id === id ? { ...team, ...changes } : team
      )
    );
  };

  const logIncident = (message) => {
    setIncidents((old) => [
      { id: Date.now().toString(), message },
      ...old,
    ]);
  };

  const playerKey = (name) =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const playerAlreadyExists = (name) =>
    teams.some((team) =>
      team.players.some(
        (player) => playerKey(player.name) === playerKey(name)
      )
    );

  const addPlayer = (teamId, name, rating, fromDraft = false) => {
    const cleanName = name.trim();
    const parsedRating = Number(rating);
    const team = findTeam(teamId);

    if (!team) {
      Alert.alert("Error", "Selecciona un equipo.");
      return false;
    }

    if (!cleanName) {
      Alert.alert("Falta el nombre", "Escribe el nombre del futbolista.");
      return false;
    }

    if (playerAlreadyExists(cleanName)) {
      Alert.alert(
        "Jugador duplicado",
        "Ese jugador ya está en otra plantilla. Las versiones alternativas cuentan como el mismo futbolista; comprueba que no esté registrado."
      );
      return false;
    }

    if (team.players.length >= 22) {
      Alert.alert("Plantilla completa", "El máximo es de 22 jugadores.");
      return false;
    }

    if (
      rating !== "" &&
      (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 99)
    ) {
      Alert.alert("Media no válida", "Introduce una media entre 1 y 99.");
      return false;
    }

    const player = {
      id: Date.now().toString() + Math.random().toString(),
      name: cleanName,
      rating: rating === "" ? null : parsedRating,
    };

    updateTeam(teamId, { players: [...team.players, player] });
    return true;
  };

  const getSigningCost = (rating) => {
    const r = Number(rating);
    if (r >= 88) return 4;
    if (r >= 85) return 3;
    if (r >= 80) return 2;
    return 1;
  };

  const registerPlayedMatch = () => {
    const h = findTeam(homeId);
    const a = findTeam(awayId);
    const hg = Number(homeGoals);
    const ag = Number(awayGoals);
    const round = Number(currentRound);

    if (!h || !a || homeId === awayId) {
      Alert.alert("Partido no válido", "Selecciona dos equipos diferentes.");
      return;
    }

    if (
      !Number.isInteger(hg) ||
      !Number.isInteger(ag) ||
      hg < 0 ||
      ag < 0 ||
      !Number.isInteger(round) ||
      round < 1
    ) {
      Alert.alert("Datos no válidos", "Revisa los goles y la jornada.");
      return;
    }

    const result = {
      id: Date.now().toString(),
      round,
      homeId,
      awayId,
      homeName: h.name,
      awayName: a.name,
      homeGoals: hg,
      awayGoals: ag,
      type: "Jugado",
    };

    setTeams((oldTeams) =>
      oldTeams.map((team) => {
        if (team.id === homeId) {
          return {
            ...team,
            gf: team.gf + hg,
            ga: team.ga + ag,
            ...(hg > ag
              ? {
                  points: team.points + 3,
                  wins: team.wins + 1,
                  coins: Math.min(8, team.coins + 1),
                }
              : hg === ag
              ? { points: team.points + 1, draws: team.draws + 1 }
              : { losses: team.losses + 1 }),
          };
        }

        if (team.id === awayId) {
          return {
            ...team,
            gf: team.gf + ag,
            ga: team.ga + hg,
            ...(ag > hg
              ? {
                  points: team.points + 3,
                  wins: team.wins + 1,
                  coins: Math.min(8, team.coins + 1),
                }
              : hg === ag
              ? { points: team.points + 1, draws: team.draws + 1 }
              : { losses: team.losses + 1 }),
          };
        }

        return team;
      })
    );

    setMatches((old) => [result, ...old]);
    setMarketRound(Math.floor((round - 1) / 3));
    Alert.alert("Resultado guardado", `${h.name} ${hg} - ${ag} ${a.name}`);
  };

  const registerUnplayed = (mode) => {
    const h = findTeam(homeId);
    const a = findTeam(awayId);
    const round = Number(currentRound);

    if (!h || !a || homeId === awayId || !Number.isInteger(round) || round < 1) {
      Alert.alert("Datos no válidos", "Selecciona dos equipos diferentes y una jornada válida.");
      return;
    }

    let homePoints = 0;
    let awayPoints = 0;
    let homeCoins = 0;
    let awayCoins = 0;
    let hg = 0;
    let ag = 0;
    let description = "";

    if (mode === "both") {
      homePoints = 1;
      awayPoints = 1;
      description = "Ambos intentaron jugar: 0-0, un punto para cada uno.";
    } else if (mode === "home") {
      hg = 3;
      homePoints = 3;
      homeCoins = 1;
      description = "Incomparecencia visitante: victoria 3-0 para el local.";
    } else if (mode === "away") {
      ag = 3;
      awayPoints = 3;
      awayCoins = 1;
      description = "Incomparecencia local: victoria 3-0 para el visitante.";
    } else {
      description = "Ninguno intentó jugar: 0-0 sin puntos.";
    }

    setTeams((oldTeams) =>
      oldTeams.map((team) => {
        if (team.id === homeId) {
          return {
            ...team,
            points: team.points + homePoints,
            coins: Math.min(8, team.coins + homeCoins),
            gf: team.gf + hg,
            ga: team.ga + ag,
            wins: team.wins + (homePoints === 3 ? 1 : 0),
            draws: team.draws + (homePoints === 1 ? 1 : 0),
            losses: team.losses + (awayPoints === 3 ? 1 : 0),
          };
        }
        if (team.id === awayId) {
          return {
            ...team,
            points: team.points + awayPoints,
            coins: Math.min(8, team.coins + awayCoins),
            gf: team.gf + ag,
            ga: team.ga + hg,
            wins: team.wins + (awayPoints === 3 ? 1 : 0),
            draws: team.draws + (awayPoints === 1 ? 1 : 0),
            losses: team.losses + (homePoints === 3 ? 1 : 0),
          };
        }
        return team;
      })
    );

    setMatches((old) => [
      {
        id: Date.now().toString(),
        round,
        homeId,
        awayId,
        homeName: h.name,
        awayName: a.name,
        homeGoals: hg,
        awayGoals: ag,
        type: "No disputado",
      },
      ...old,
    ]);

    logIncident(description);
    Alert.alert("Incidencia registrada", description);
  };

  const startDraft = () => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const order = [];

    // 18 rondas de selección, en formato serpiente.
    for (let round = 0; round < 18; round++) {
      const roundTeams = round % 2 === 0 ? shuffled : [...shuffled].reverse();
      roundTeams.forEach((team) => order.push(team.id));
    }

    setDraftOrder(order);
    setDraftPick(0);
    setDraftStarted(true);
    logIncident("Se ha generado el orden aleatorio del draft.");
    Alert.alert("Draft generado", "El orden aleatorio está listo.");
  };

  const makeDraftPick = () => {
    if (!draftStarted || draftPick >= draftOrder.length) {
      Alert.alert("Draft", "Genera el draft o ya se han completado las selecciones.");
      return;
    }

    const teamId = draftOrder[draftPick];
    const team = findTeam(teamId);

    if (team.players.length >= 18) {
      Alert.alert("Plantilla inicial completa", `${team.name} ya tiene 18 jugadores.`);
      return;
    }

    if (addPlayer(teamId, playerName, playerRating, true)) {
      setPlayerName("");
      setPlayerRating("");
      setDraftPick((pick) => pick + 1);
      Alert.alert("Selección guardada", `${team.name} ha seleccionado a su jugador.`);
    }
  };

  const signPlayer = () => {
    const team = findTeam(marketTeam);
    const rating = Number(marketRating);
    const cleanName = marketPlayer.trim();
    const round = Number(currentRound);

    if (!team || !cleanName || !Number.isFinite(rating) || rating < 1 || rating > 99) {
      Alert.alert("Datos incompletos", "Introduce equipo, jugador y media válida.");
      return;
    }

    if (!Number.isInteger(round) || round < 1 || round % 3 !== 0) {
      Alert.alert("Mercado cerrado", "El mercado se abre cada 3 jornadas. Cambia la jornada actual en Admin.");
      return;
    }

    if (playerAlreadyExists(cleanName)) {
      Alert.alert("Jugador ocupado", "Ese futbolista ya pertenece a una plantilla.");
      return;
    }

    if (team.players.length >= 22) {
      Alert.alert("Plantilla completa", "El máximo es de 22 jugadores.");
      return;
    }

    const windowNumber = Math.floor(round / 3);
    const key = `${marketTeam}-${windowNumber}`;
    const count = signings[key] || 0;

    if (count >= 2) {
      Alert.alert("Límite alcanzado", "Cada equipo puede realizar un máximo de 2 fichajes por ventana.");
      return;
    }

    const cost = getSigningCost(rating);

    if (team.coins < cost) {
      Alert.alert("COINS insuficientes", `Este fichaje cuesta ${cost} COINS y el equipo tiene ${team.coins}.`);
      return;
    }

    const success = addPlayer(marketTeam, cleanName, rating);

    if (success) {
      updateTeam(marketTeam, {
        coins: team.coins - cost,
      });
      setSignings((old) => ({ ...old, [key]: count + 1 }));
      setMarketPlayer("");
      setMarketRating("");
      logIncident(`${team.name} ficha a ${cleanName} por ${cost} COINS.`);
      Alert.alert("Fichaje completado", `${cleanName} cuesta ${cost} COINS.`);
    }
  };

  const releasePlayer = () => {
    const team = findTeam(selectedTeam);
    const cleanName = releaseName.trim();

    if (!team || !cleanName) {
      Alert.alert("Falta información", "Selecciona el equipo y escribe el nombre del jugador.");
      return;
    }

    const player = team.players.find(
      (item) => playerKey(item.name) === playerKey(cleanName)
    );

    if (!player) {
      Alert.alert("No encontrado", "Ese jugador no está en la plantilla seleccionada.");
      return;
    }

    updateTeam(selectedTeam, {
      players: team.players.filter((item) => item.id !== player.id),
    });

    setReleaseName("");
    logIncident(`${player.name} ha sido liberado por ${team.name}. No se devuelven COINS.`);
    Alert.alert("Jugador liberado", `${player.name} ya está disponible para el mercado.`);
  };

  const addTeam = () => {
    const name = newTeamName.trim();
    const owner = newOwner.trim();

    if (!name || !owner) {
      Alert.alert("Datos incompletos", "Introduce el nombre del equipo y su propietario.");
      return;
    }

    if (teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert("Equipo duplicado", "Ya existe un equipo con ese nombre.");
      return;
    }

    const id = String(Math.max(...teams.map((team) => Number(team.id))) + 1);

    setTeams((old) => [
      ...old,
      {
        id,
        name,
        owner,
        points: 0,
        coins: 0,
        players: [],
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
      },
    ]);

    setNewTeamName("");
    setNewOwner("");
    logIncident(`Nuevo participante añadido: ${name} — ${owner}.`);
    Alert.alert("Participante añadido", `${name} empieza con 0 puntos y 0 COINS.`);
  };

  const sortedTeams = [...teams].sort(
    (a, b) =>
      b.points - a.points ||
      (b.gf - b.ga) - (a.gf - a.ga) ||
      b.gf - a.gf ||
      a.name.localeCompare(b.name)
  );

  const currentDraftTeam =
    draftStarted && draftPick < draftOrder.length
      ? findTeam(draftOrder[draftPick])
      : null;

  const marketOpen =
    Number(currentRound) > 0 &&
    Number(currentRound) % 3 === 0;

  const Button = ({ title, onPress, secondary = false, disabled = false }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const TeamSelector = ({ value, onChange, exclude }) => (
    <View style={styles.selectorWrap}>
      {teams
        .filter((team) => team.id !== exclude)
        .map((team) => (
          <TouchableOpacity
            key={team.id}
            onPress={() => onChange(team.id)}
            style={[
              styles.teamChip,
              value === team.id && styles.selectedChip,
            ]}
          >
            <Text
              style={[
                styles.teamChipText,
                value === team.id && styles.selectedChipText,
              ]}
            >
              {team.name}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );

  const Field = ({ label, value, onChangeText, placeholder, keyboardType }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ""}
        placeholderTextColor="#777"
        keyboardType={keyboardType || "default"}
        autoCapitalize="sentences"
      />
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>LA LIGA TEIDE</Text>
        <Text style={styles.subtitle}>Gestión de la liga Ultimate Team</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {initialTabs.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setTab(item)}
            style={[styles.tab, tab === item && styles.activeTab]}
          >
            <Text style={[styles.tabText, tab === item && styles.activeTabText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {tab === "Liga" && (
          <>
            <Section title="Clasificación">
              <Text style={styles.muted}>
                Orden: puntos, diferencia de goles y goles a favor.
              </Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableText, styles.pos]}>#</Text>
                <Text style={[styles.tableText, styles.club]}>Equipo</Text>
                <Text style={styles.tableText}>PJ</Text>
                <Text style={styles.tableText}>DG</Text>
                <Text style={styles.tableText}>PTS</Text>
                <Text style={styles.tableText}>COINS</Text>
              </View>
              {sortedTeams.map((team, index) => (
                <View key={team.id} style={styles.tableRow}>
                  <Text style={[styles.tableText, styles.pos]}>{index + 1}</Text>
                  <View style={styles.club}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.smallText}>{team.owner}</Text>
                  </View>
                  <Text style={styles.tableText}>
                    {team.wins + team.draws + team.losses}
                  </Text>
                  <Text style={styles.tableText}>{team.gf - team.ga}</Text>
                  <Text style={styles.points}>{team.points}</Text>
                  <Text style={styles.tableText}>{team.coins}</Text>
                </View>
              ))}
            </Section>

            <Section title="Reglas principales">
              <Text style={styles.rule}>• Victoria: 3 puntos y +1 COIN, máximo 8 COINS.</Text>
              <Text style={styles.rule}>• Empate: 1 punto para cada equipo.</Text>
              <Text style={styles.rule}>• Dos equipos que intentan jugar sin encontrar horario: 0-0 y 1 punto cada uno.</Text>
              <Text style={styles.rule}>• Un equipo demuestra que lo intentó y el rival no aparece: 3-0 y +1 COIN para el equipo que sí lo intentó.</Text>
              <Text style={styles.rule}>• Si ninguno lo intenta: 0-0 y sin puntos.</Text>
              <Text style={styles.rule}>• Desempates pendientes de resolver: enfrentamiento directo y, si hace falta, partido de desempate.</Text>
            </Section>
          </>
        )}

        {tab === "Partidos" && (
          <>
            <Section title="Registrar resultado">
              <Field
                label="Jornada"
                value={currentRound}
                onChangeText={setCurrentRound}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Equipo local</Text>
              <TeamSelector
                value={homeId}
                onChange={setHomeId}
                exclude={awayId}
              />

              <Text style={styles.label}>Equipo visitante</Text>
              <TeamSelector
                value={awayId}
                onChange={setAwayId}
                exclude={homeId}
              />

              <View style={styles.scoreRow}>
                <View style={styles.scoreField}>
                  <Field
                    label="Goles local"
                    value={homeGoals}
                    onChangeText={setHomeGoals}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.scoreDash}>—</Text>
                <View style={styles.scoreField}>
                  <Field
                    label="Goles visitante"
                    value={awayGoals}
                    onChangeText={setAwayGoals}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Button title="Guardar resultado" onPress={registerPlayedMatch} />
            </Section>

            <Section title="Partido no disputado">
              <Text style={styles.muted}>
                Usa la opción que corresponda y guarda la incidencia.
              </Text>
              <Button
                title="Ambos lo intentaron: 0-0 y 1 punto cada uno"
                onPress={() => registerUnplayed("both")}
                secondary
              />
              <Button
                title="El local lo intentó; visitante no apareció: 3-0"
                onPress={() => registerUnplayed("home")}
                secondary
              />
              <Button
                title="El visitante lo intentó; local no apareció: 0-3"
                onPress={() => registerUnplayed("away")}
                secondary
              />
              <Button
                title="Ninguno lo intentó: 0-0 sin puntos"
                onPress={() => registerUnplayed("neither")}
                secondary
              />
            </Section>

            <Section title="Resultados registrados">
              {matches.length === 0 ? (
                <Text style={styles.muted}>Todavía no hay partidos registrados.</Text>
              ) : (
                matches.map((match) => (
                  <View key={match.id} style={styles.matchRow}>
                    <Text style={styles.smallText}>Jornada {match.round}</Text>
                    <Text style={styles.matchText}>
                      {match.homeName} {match.homeGoals} - {match.awayGoals} {match.awayName}
                    </Text>
                    <Text style={styles.smallText}>{match.type}</Text>
                  </View>
                ))
              )}
            </Section>
          </>
        )}

        {tab === "Draft" && (
          <>
            <Section title="Draft inicial">
              <Text style={styles.rule}>
                El orden de los equipos se sortea aleatoriamente. Las elecciones van en serpiente y cada equipo dispone de 18 plazas iniciales.
              </Text>
              <Button
                title="Generar orden aleatorio del draft"
                onPress={() =>
                  Alert.alert(
                    "Confirmar draft",
                    "Esto generará un nuevo orden aleatorio y reiniciará el turno actual del draft.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Generar", onPress: startDraft },
                    ]
                  )
                }
              />

              {draftStarted && (
                <>
                  <Text style={styles.draftCount}>
                    Selección {Math.min(draftPick + 1, draftOrder.length)} de {draftOrder.length}
                  </Text>
                  {currentDraftTeam ? (
                    <View style={styles.highlightBox}>
                      <Text style={styles.muted}>Le toca elegir a</Text>
                      <Text style={styles.highlightTitle}>{currentDraftTeam.name}</Text>
                      <Text style={styles.smallText}>Propietario: {currentDraftTeam.owner}</Text>
                    </View>
                  ) : (
                    <Text style={styles.points}>Draft completado.</Text>
                  )}

                  <Field
                    label="Nombre del futbolista"
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Ej. Kylian Mbappé"
                  />
                  <Field
                    label="Media del futbolista"
                    value={playerRating}
                    onChangeText={setPlayerRating}
                    placeholder="Ej. 91"
                    keyboardType="numeric"
                  />
                  <Button
                    title="Confirmar elección"
                    onPress={makeDraftPick}
                    disabled={!currentDraftTeam}
                  />
                  <Button
                    title="Ver orden del draft"
                    secondary
                    onPress={() =>
                      Alert.alert(
                        "Orden del draft",
                        draftOrder
                          .map((id, index) => {
                            const team = findTeam(id);
                            return `${index + 1}. ${team ? team.name : "Equipo"}`;
                          })
                          .join("\n")
                      )
                    }
                  />
                </>
              )}
            </Section>
          </>
        )}

        {tab === "Plantillas" && (
          <>
            <Section title="Seleccionar equipo">
              <TeamSelector value={selectedTeam} onChange={setSelectedTeam} />
            </Section>

            {findTeam(selectedTeam) && (
              <Section title={`${findTeam(selectedTeam).name} — Plantilla`}>
                <Text style={styles.muted}>
                  {findTeam(selectedTeam).players.length} de 22 jugadores
                </Text>
                {findTeam(selectedTeam).players.length === 0 ? (
                  <Text style={styles.muted}>Esta plantilla todavía está vacía.</Text>
                ) : (
                  findTeam(selectedTeam).players.map((player, index) => (
                    <View key={player.id} style={styles.playerRow}>
                      <Text style={styles.playerNumber}>{index + 1}.</Text>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerRating}>
                        {player.rating == null ? "—" : player.rating}
                      </Text>
                    </View>
                  ))
                )}
              </Section>
            )}

            <Section title="Añadir jugador manualmente">
              <Text style={styles.muted}>
                Para incorporar jugadores fuera del draft, selecciona el equipo y añade el nombre y la media.
              </Text>
              <Field
                label="Nombre del futbolista"
                value={playerName}
                onChangeText={setPlayerName}
              />
              <Field
                label="Media"
                value={playerRating}
                onChangeText={setPlayerRating}
                keyboardType="numeric"
              />
              <Button
                title="Añadir a la plantilla"
                onPress={() => {
                  if (addPlayer(selectedTeam, playerName, playerRating)) {
                    setPlayerName("");
                    setPlayerRating("");
                    Alert.alert("Jugador añadido", "La plantilla se ha actualizado.");
                  }
                }}
              />
            </Section>

            <Section title="Liberar jugador">
              <Text style={styles.muted}>
                Liberar un jugador no devuelve las COINS gastadas.
              </Text>
              <Field
                label="Nombre exacto del futbolista"
                value={releaseName}
                onChangeText={setReleaseName}
              />
              <Button
                title="Liberar jugador"
                onPress={() =>
                  Alert.alert(
                    "Confirmar liberación",
                    `¿Quieres liberar a ${releaseName.trim()}?`,
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Liberar", style: "destructive", onPress: releasePlayer },
                    ]
                  )
                }
                secondary
              />
            </Section>
          </>
        )}

        {tab === "Mercado" && (
          <>
            <Section title="Estado del mercado">
              <Text style={styles.marketStatus}>
                {marketOpen ? "MERCADO ABIERTO" : "MERCADO CERRADO"}
              </Text>
              <Text style={styles.muted}>
                Se abre cada 3 jornadas. Jornada actual: {currentRound}.
              </Text>
              <Text style={styles.rule}>Media 88 o superior: 4 COINS.</Text>
              <Text style={styles.rule}>Media 85–87: 3 COINS.</Text>
              <Text style={styles.rule}>Media 80–84: 2 COINS.</Text>
              <Text style={styles.rule}>Media inferior a 80: 1 COIN.</Text>
              <Text style={styles.rule}>
                Máximo 2 fichajes por equipo en cada ventana. Plantilla máxima: 22 jugadores.
              </Text>
            </Section>

            <Section title="Fichar jugador">
              <Text style={styles.label}>Equipo comprador</Text>
              <TeamSelector value={marketTeam} onChange={setMarketTeam} />
              {findTeam(marketTeam) && (
                <Text style={styles.muted}>
                  COINS disponibles: {findTeam(marketTeam).coins}
                </Text>
              )}
              <Field
                label="Nombre del futbolista"
                value={marketPlayer}
                onChangeText={setMarketPlayer}
              />
              <Field
                label="Media"
                value={marketRating}
                onChangeText={setMarketRating}
                keyboardType="numeric"
              />
              {marketRating !== "" && Number(marketRating) >= 1 && Number(marketRating) <= 99 && (
                <Text style={styles.costText}>
                  Coste estimado: {getSigningCost(marketRating)} COINS
                </Text>
              )}
              <Button
                title="Confirmar fichaje"
                onPress={signPlayer}
                disabled={!marketOpen}
              />
            </Section>

            <Section title="Intercambios">
              <Text style={styles.rule}>
                Los intercambios de jugador por jugador deben ser aceptados por ambos propietarios y anunciarse públicamente.
              </Text>
              <Text style={styles.muted}>
                La aceptación y el anuncio deben comprobarse manualmente antes de actualizar las plantillas.
              </Text>
            </Section>

            <Section title="Subastas">
              <Text style={styles.rule}>
                Si varios equipos quieren al mismo jugador, se lo lleva la oferta más alta de COINS.
              </Text>
              <Text style={styles.muted}>
                Las pujas y la resolución de subastas todavía deben gestionarse manualmente.
              </Text>
            </Section>
          </>
        )}

        {tab === "Admin" && (
          <>
            <Section title="Configuración de jornada">
              <Field
                label="Jornada actual"
                value={currentRound}
                onChangeText={setCurrentRound}
                keyboardType="numeric"
              />
              <Text style={styles.muted}>
                Cada jornada dura 3 días. Dos jornadas por semana: lunes-jueves y viernes-domingo.
              </Text>
              <Button
                title="Actualizar jornada"
                onPress={() => {
                  const round = Number(currentRound);
                  if (!Number.isInteger(round) || round < 1) {
                    Alert.alert("Jornada no válida", "Introduce un número de jornada igual o superior a 1.");
                    return;
                  }
                  Alert.alert("Jornada actualizada", `Jornada ${round}.`);
                }}
              />
            </Section>

            <Section title="Añadir participante">
              <Field
                label="Nombre del equipo"
                value={newTeamName}
                onChangeText={setNewTeamName}
                placeholder="Ej. Nuevo FC"
              />
              <Field
                label="Nombre del propietario"
                value={newOwner}
                onChangeText={setNewOwner}
                placeholder="Ej. Juan"
              />
              <Button title="Añadir participante" onPress={addTeam} />
              <Text style={styles.muted}>
                El nuevo participante comienza con 0 puntos, 0 COINS y plantilla vacía.
              </Text>
            </Section>

            <Section title="Incidencias">
              <Field
                label="Anotar incidencia"
                value={incidentText}
                onChangeText={setIncidentText}
                placeholder="Describe lo ocurrido"
              />
              <Button
                title="Guardar incidencia"
                onPress={() => {
                  if (!incidentText.trim()) {
                    Alert.alert("Falta el texto", "Escribe la incidencia.");
                    return;
                  }
                  logIncident(incidentText.trim());
                  setIncidentText("");
                  Alert.alert("Incidencia guardada", "Se ha añadido al registro.");
                }}
              />
              {incidents.length === 0 ? (
                <Text style={styles.muted}>Todavía no hay incidencias.</Text>
              ) : (
                incidents.map((incident) => (
                  <View key={incident.id} style={styles.incidentRow}>
                    <Text style={styles.rule}>{incident.message}</Text>
                  </View>
                ))
              )}
            </Section>

            <Section title="Participantes registrados">
              {teams.map((team) => (
                <View key={team.id} style={styles.teamAdminRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.smallText}>{team.owner}</Text>
                  </View>
                  <Text style={styles.tableText}>
                    {team.points} PTS · {team.coins} COINS
                  </Text>
                </View>
              ))}
            </Section>

            <Section title="Aviso importante">
              <Text style={styles.rule}>
                Esta versión guarda los datos solo mientras la aplicación permanece abierta. Si se recarga o se cierra, los cambios pueden perderse.
              </Text>
              <Text style={styles.rule}>
                El enfrentamiento directo, los playoffs, las votaciones de intercambio, las subastas y la sincronización entre móviles todavía no están automatizados.
              </Text>
            </Section>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>LA LIGA TEIDE · Temporada Ultimate Team</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b0d12",
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#11151d",
    borderBottomWidth: 1,
    borderBottomColor: "#252c38",
  },
  title: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#9ba7ba",
    fontSize: 13,
    marginTop: 4,
  },
  tabs: {
    maxHeight: 54,
    backgroundColor: "#11151d",
  },
  tabsContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginHorizontal: 3,
    borderRadius: 9,
    backgroundColor: "#1a202b",
  },
  activeTab: {
    backgroundColor: "#c9f15b",
  },
  tabText: {
    color: "#c0c8d5",
    fontSize: 13,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#11151d",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#141923",
    borderRadius: 14,
    padding: 14,
    marginTop: 13,
    borderWidth: 1,
    borderColor: "#242c39",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
  muted: {
    color: "#a0aabd",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 9,
  },
  label: {
    color: "#dce2ec",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 6,
  },
  field: {
    marginBottom: 9,
  },
  input: {
    backgroundColor: "#0c1017",
    borderWidth: 1,
    borderColor: "#303949",
    borderRadius: 9,
    color: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#c9f15b",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  buttonText: {
    color: "#10140c",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#202735",
    borderWidth: 1,
    borderColor: "#354052",
  },
  secondaryButtonText: {
    color: "#e2e8f2",
  },
  disabledButton: {
    opacity: 0.4,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#343d4b",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#252c38",
  },
  tableText: {
    color: "#e0e6f0",
    fontSize: 11,
    textAlign: "center",
    minWidth: 26,
  },
  pos: {
    width: 22,
    minWidth: 22,
  },
  club: {
    flex: 1,
    minWidth: 80,
    paddingRight: 4,
  },
  teamName: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  smallText: {
    color: "#8f9bae",
    fontSize: 10,
    marginTop: 3,
  },
  points: {
    color: "#c9f15b",
    fontSize: 13,
    fontWeight: "900",
    minWidth: 26,
    textAlign: "center",
  },
  rule: {
    color: "#cbd3e0",
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 6,
  },
  selectorWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  teamChip: {
    backgroundColor: "#0c1017",
    borderWidth: 1,
    borderColor: "#303949",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  selectedChip: {
    backgroundColor: "#c9f15b",
    borderColor: "#c9f15b",
  },
  teamChipText: {
    color: "#cbd3e0",
    fontSize: 11,
    fontWeight: "700",
  },
  selectedChipText: {
    color: "#11151d",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreField: {
    flex: 1,
  },
  scoreDash: {
    color: "#ffffff",
    fontSize: 20,
    marginHorizontal: 10,
    marginTop: 15,
  },
  matchRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#252c38",
  },
  matchText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
    marginVertical: 4,
  },
  draftCount: {
    color: "#c9f15b",
    fontSize: 14,
    fontWeight: "800",
    marginVertical: 12,
  },
  highlightBox: {
    backgroundColor: "#202735",
    padding: 13,
    borderRadius: 10,
    marginBottom: 12,
  },
  highlightTitle: {
    color: "#c9f15b",
    fontSize: 20,
    fontWeight: "900",
    marginVertical: 4,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#252c38",
  },
  playerNumber: {
    color: "#8f9bae",
    width: 25,
    fontSize: 12,
  },
  playerName: {
    color: "#ffffff",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  playerRating: {
    color: "#c9f15b",
    fontSize: 13,
    fontWeight: "900",
    minWidth: 25,
    textAlign: "right",
  },
  marketStatus: {
    color: "#c9f15b",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 7,
  },
  costText: {
    color: "#c9f15b",
    fontSize: 14,
    fontWeight: "800",
    marginVertical: 5,
  },
  incidentRow: {
    borderTopWidth: 1,
    borderTopColor: "#303949",
    paddingTop: 10,
    marginTop: 5,
  },
  teamAdminRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#252c38",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 22,
  },
  footerText: {
    color: "#68758a",
    fontSize: 10,
  },
});
