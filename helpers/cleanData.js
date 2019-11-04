
const cleanData = function(string) {
    return string
        // Remove all special characters
        .replace(/!/gi, "")
        .replace(/\[/g, "")
        .replace(/\]/g, "")
        .replace(/'/g, "")
        // Remove all double spaces
        .replace(/  /g, " ")
        // Replace some characters with dashes instead
        .replace(/\./g, "-")
        .replace(/\^/g, "-")
        .replace(/ /g, "-")
        .toLowerCase();
};

module.exports = cleanData;

// console.log(cleanData("Michael Myers Jr."), "michael-myers-jr-");   // michael-myers-jr-
// console.log(cleanData("R-evolution GFX"), "r-evolution-gfx");       // r-evolution-gfx
// console.log(cleanData("Tek-Man"), "tek-man");                       // tek-man
// console.log(cleanData("H.Heal"), "h-heal");                         // h-heal
// console.log(cleanData("Be Human[e] Apparel"), "be-humane-apparel"); // be-humane-apparel
// console.log(cleanData("Art_Of_One"), "art_of_one");                 // art_of_one
// console.log(cleanData("angi-pants"), "angi-pants");                 // angi-pants
// console.log(cleanData("Dar'Qaris"), "darqaris");                    // darqaris
// console.log(cleanData("Kyoki^3"), "kyoki-3");                       // kyoki-3


// console.table([ 
//     {Original: "Michael Myers Jr.", Expected: "michael-myers-jr-", Cleaned: cleanData("Michael Myers Jr."), isEqual: `${"michael-myers-jr-" === cleanData("Michael Myers Jr.")}`  }, 
//     {Original: "R-evolution GFX", Expected: "r-evolution-gfx", Cleaned: cleanData("R-evolution GFX."), isEqual: `${"r-evolution-gfx" === cleanData("R-evolution GFX")}`  }, 
//     {Original: "Tek-Man", Expected: "tek-man", Cleaned: cleanData("Tek-Man"), isEqual: `${"tek-man" === cleanData("Tek-Man")}`  }, 
//     {Original: "H.Heal", Expected: "h-heal", Cleaned: cleanData("H.Heal"), isEqual: `${"h-heal" === cleanData("H.Heal")}`  }, 
//     {Original: "Be Human[e] Apparel", Expected: "be-humane-apparel", Cleaned: cleanData("Be Human[e] Apparel"), isEqual: `${"be-humane-apparel" === cleanData("Be Human[e] Apparel")}`  }, 
//     {Original: "Art_Of_One", Expected: "art_of_one", Cleaned: cleanData("Art_Of_One"), isEqual: `${"art_of_one" === cleanData("Art_Of_One")}`  }, 
//     {Original: "angi-pants", Expected: "ngi-pants", Cleaned: cleanData("angi-pants"), isEqual: `${"angi-pants" === cleanData("angi-pants")}`  }, 
//     {Original: "Dar'Qaris", Expected: "darqaris", Cleaned: cleanData("Dar'Qaris"), isEqual: `${"darqaris" === cleanData("Dar'Qaris")}`  }, 
//     {Original: "Kyoki^3", Expected: "kyoki-3", Cleaned: cleanData("Kyoki^3"), isEqual: `${"kyoki-3" === cleanData("Kyoki^3")}`  }, 
//     {Original: "", Expected: "", Cleaned: cleanData(""), isEqual: `${"" === cleanData("")}`  }, 
// ]);