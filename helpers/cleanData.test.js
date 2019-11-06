const expect = require("chai").expect;
const cleanData = require("./cleanData.js");

describe("cleanData", function () {
    it("Michael Myers Jr.", function () {
      expect(cleanData("Michael Myers Jr.")).to.equal("michael-myers-jr");
    });
    
    it("R-evolution GFX", function () {
      expect(cleanData("R-evolution GFX")).to.equal("r-evolution-gfx");
    });
    
    it("Tek-Man", function () {
      expect(cleanData("Tek-Man")).to.equal("tek-man");
    });
    
    it("H.Heal", function () {
      expect(cleanData("H.Heal")).to.equal("h-heal");
    });
    
    it("Be Human[e] Apparel", function () {
      expect(cleanData("Be Human[e] Apparel")).to.equal("be-humane-apparel");
    });
    
    it("Art_Of_One", function () {
      expect(cleanData("Art_Of_One")).to.equal("art_of_one");
    });
    
    it("angi-pants", function () {
      expect(cleanData("angi-pants")).to.equal("angi-pants");
    });
    
    it("Dar'Qaris", function () {
      expect(cleanData("Dar'Qaris")).to.equal("darqaris");
    });
    
    it("Kyoki^3", function () {
      expect(cleanData("Kyoki^3")).to.equal("kyoki-3");
    });
    
    it("America *!@# Yeah", function () {
      expect(cleanData("America *!@# Yeah")).to.equal("america-yeah");
    });

    it("Can't Find Him...", function () {
      expect(cleanData("Can't Find Him...")).to.equal("cant-find-him");
    });
    
    it("...finds a way", function () {
      expect(cleanData("...finds a way")).to.equal("finds-a-way");
    });
    
    it("3-2-1...Let's Jam", function () {
      expect(cleanData("3-2-1...Let's Jam")).to.equal("3-2-1lets-jam");
    });
    
    it("Kill Him, Mr. B", function () {
      expect(cleanData("Kill Him, Mr. B")).to.equal("kill-him-mr-b");
    });
    
    it("Knight Vs. King", function () {
      expect(cleanData("Knight Vs. King")).to.equal("knight-vs-king");
    });
    
    it("Madame Vastra & Jenny", function () {
      expect(cleanData("Madame Vastra & Jenny")).to.equal("madame-vastra-jenny");
    });

    it("dr. lupo", function() {
      expect(cleanData("dr. lupo")).to.equal('dr-lupo');
    });

    it("Build It. Love It.", function() {
      expect(cleanData("Build It. Love It.")).to.equal('build-it-love-it');
    });

    it("D. Nyah", function() {
      expect(cleanData("D. Nyah")).to.equal('d-nyah');
    });

    it("Aaron A. Fimister", function() {
      expect(cleanData("Aaron A. Fimister")).to.equal('aaron-a-fimister');
    });

    it("Don't Blink. Don't Even Blink.", function() {
      expect(cleanData("Don't Blink. Don't Even Blink.")).to.equal('dont-blink-dont-even-blink');
    });

    it("G. I'm. Old", function() {
      expect(cleanData("G. I'm. Old")).to.equal('g-im-old');
    });

    it("G.I. Jim", function() {
      expect(cleanData("G.I. Jim")).to.equal('g-i-jim');
    });

    it("It's-a Me. Oroku Saki!", function() {
      expect(cleanData("It's-a Me. Oroku Saki!")).to.equal('its-a-me-oroku-saki');
    });

    it("L. the Third", function() {
      expect(cleanData("L. the Third")).to.equal('l-the-third');
    });

    it("M. B. Brown", function() {
      expect(cleanData("M. B. Brown")).to.equal('m-b-brown');
    });

});
