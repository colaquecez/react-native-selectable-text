import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { SelectableText } from "./SelectableText.js";

export default function App() {
  return (
    <View style={styles.container}>
      <Text selectable></Text>
      <SelectableText
        selectable={true}
        menuItems={["Replace", "Bar"]}
        onSelection={console.log}
        style={styles.welcome}
        value="Astrocoders"
      />
      <SelectableText
        menuItems={["Foo", "Bar"]}
        onSelection={console.log}
        style={styles.welcome}
      >
        Go Beyond
      </SelectableText>
      <SelectableText
        selectable={true}
        menuItems={["Astro", "Coders"]}
        onSelection={console.log}
        style={styles.instructions}
        value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eleifend laoreet risus nec accumsan. In bibendum urna id ante vehicula auctor. Donec ipsum nisi, malesuada quis erat ac, molestie facilisis lacus. Vestibulum a erat dui. In imperdiet, purus at venenatis fermentum, dui neque congue est, in suscipit metus magna malesuada ex. In hendrerit tincidunt mi, vel rhoncus eros dignissim non. Nulla tincidunt, tortor et dictum fermentum, sapien leo blandit nunc, nec rutrum nulla libero nec elit. Sed vitae urna sed eros volutpat venenatis. Nulla finibus velit ac odio elementum pharetra. Ut mollis metus est, vitae blandit urna venenatis at."
      />
      <SelectableText
        selectable={true}
        menuItems={["Crave", "Star", "Damage"]}
        onSelection={console.log}
        style={styles.instructions}
        value="Quisque nec faucibus ligula. Nam ut congue mauris. Duis quis risus dolor. Praesent tempor est elit, in pretium risus sodales ac. Cras fermentum aliquam feugiat. Pellentesque in dapibus ex. Suspendisse ut magna maximus, scelerisque dui in, finibus ipsum. Nullam non justo ornare, faucibus lorem non, congue nisl. Cras venenatis ex vitae lacinia posuere. In congue porttitor velit id porta. In fermentum ultricies est nec sagittis. Etiam eget commodo ex, vel placerat nulla. Phasellus porttitor, libero eget ornare pellentesque, ipsum ex ultrices metus, et volutpat neque magna a ante."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    padding: 10
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    color: "#FF0000"
  },
  instructions: {
    textAlign: "center",
    marginBottom: 5,
    color: "#0000FF"
  }
});