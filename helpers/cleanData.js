
const cleanData = function(string) {
    let tempStr = string
        // Remove all special characters
        .replace(/!/gi, "")
        .replace(/\[/g, "")
        .replace(/\]/g, "")
        .replace(/'/g, "")
        .replace(/"/g, "")
        .replace(/\#/g, "")
        .replace(/\$/g, "")
        .replace(/\%/g, "")
        .replace(/\&/g, "")
        .replace(/\?/g, "")
        .replace(/\)/g, "")
        .replace(/\(/g, "")
        .replace(/\*/g, "")
        .replace(/\@/g, "")
        .replace(/\+/g, "")
        .replace(/\//g, "")
        .replace(/\,/g, "")
        .replace(/\~/g, "")
        .replace(/\{/g, "")
        .replace(/\}/g, "")
        .replace(/\|/g, "")
        .replace(/\}/g, "")
        .replace(/\\/g, "")
        .replace(/\:/g, "")
        // .replace(//g, "")
        // Remove all double spaces
        .replace(/\.\.\./g, "")
        .replace(/  /g, " ")
        // Replace some characters with dashes instead
        .replace(/ /g, "-")
        .replace(/\./g, "-")
        .replace(/\^/g, "-")

        // replace one or more hyphens with a single hyphen, globally
        .replace(/-+/g,"-") 

        // replace all hyphens at beginning and end of string.
        .replace(/^-+|-+$/g,"") 

        .toLowerCase();
    
    return tempStr;
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
// console.log(cleanData("America *!@# Yeah"), "america-at-yeah-hoodie");             // america-at-yeah-hoodie
// console.log(cleanData("Can't Find Him..."), "cant-find-him");             // cant-find-him
// console.log(cleanData("...finds a way"), "cant-find-him");             // ...finds a way
// console.log(cleanData("3-2-1...Let's Jam"), "cant-find-him");             // ...finds a way
// console.log(cleanData("Kill Him, Mr. B"), "cant-find-him");             // ...finds a way
// console.log(cleanData("Knight Vs. King"), "cant-find-him");             // ...finds a way
// console.log(cleanData("Madame Vastra & Jenny"), "madame-vastra-jenny");             // madame-vastra-jenny


console.table([ 
    {Original: "Michael Myers Jr.", Expected: "michael-myers-jr", Cleaned: cleanData("Michael Myers Jr."), isEqual: `${"michael-myers-jr" === cleanData("Michael Myers Jr.")}`  }, 
    {Original: "R-evolution GFX", Expected: "r-evolution-gfx", Cleaned: cleanData("R-evolution GFX."), isEqual: `${"r-evolution-gfx" === cleanData("R-evolution GFX")}`  }, 
    {Original: "Tek-Man", Expected: "tek-man", Cleaned: cleanData("Tek-Man"), isEqual: `${"tek-man" === cleanData("Tek-Man")}`  }, 
    {Original: "H.Heal", Expected: "h-heal", Cleaned: cleanData("H.Heal"), isEqual: `${"h-heal" === cleanData("H.Heal")}`  }, 
    {Original: "Be Human[e] Apparel", Expected: "be-humane-apparel", Cleaned: cleanData("Be Human[e] Apparel"), isEqual: `${"be-humane-apparel" === cleanData("Be Human[e] Apparel")}`  }, 
    {Original: "Art_Of_One", Expected: "art_of_one", Cleaned: cleanData("Art_Of_One"), isEqual: `${"art_of_one" === cleanData("Art_Of_One")}`  }, 
    {Original: "angi-pants", Expected: "ngi-pants", Cleaned: cleanData("angi-pants"), isEqual: `${"angi-pants" === cleanData("angi-pants")}`  }, 
    {Original: "Dar'Qaris", Expected: "darqaris", Cleaned: cleanData("Dar'Qaris"), isEqual: `${"darqaris" === cleanData("Dar'Qaris")}`  }, 
    {Original: "Kyoki^3", Expected: "kyoki-3", Cleaned: cleanData("Kyoki^3"), isEqual: `${"kyoki-3" === cleanData("Kyoki^3")}`  }, 
    {Original: "America *!@# Yeah", Expected: "america-yeah", Cleaned: cleanData("America *!@# Yeah"), isEqual: `${"america-yeah" === cleanData("America *!@# Yeah")}`  }, 
    {Original: "Can't Find Him...", Expected: "cant-find-him", Cleaned: cleanData("Can't Find Him..."), isEqual: `${"cant-find-him" === cleanData("Can't Find Him...")}`  }, 
    {Original: "...finds a way", Expected: "finds-a-way", Cleaned: cleanData("...finds a way"), isEqual: `${"finds-a-way" === cleanData("...finds a way")}`  }, 
    {Original: "3-2-1...Let's Jam", Expected: "3-2-1lets-jam", Cleaned: cleanData("3-2-1...Let's Jam"), isEqual: `${"3-2-1lets-jam" === cleanData("3-2-1...Let's Jam")}`  }, 
    {Original: "3 Little Pigs: Mechanized Assault", Expected: "3-little-pigs-mechanized-assault", Cleaned: cleanData("3 Little Pigs: Mechanized Assault"), isEqual: `${"3-little-pigs-mechanized-assault" === cleanData("3 Little Pigs: Mechanized Assault")}`  }, 
    {Original: "Kill Him, Mr. B", Expected: "kill-him-mr-b", Cleaned: cleanData("Kill Him, Mr. B"), isEqual: `${"kill-him-mr-b" === cleanData("Kill Him, Mr. B")}`  }, 
    {Original: "Knight Vs. King", Expected: "knight-vs-king", Cleaned: cleanData("Knight Vs. King"), isEqual: `${"knight-vs-king" === cleanData("Knight Vs. King")}`  }, 
    {Original: "Madame Vastra & Jenny", Expected: "madame-vastra-jenny", Cleaned: cleanData("Madame Vastra & Jenny"), isEqual: `${"madame-vastra-jenny" === cleanData("Madame Vastra & Jenny")}`  }, 
    {Original: "", Expected: "", Cleaned: cleanData(""), isEqual: `${"" === cleanData("")}`  }, 
]);
