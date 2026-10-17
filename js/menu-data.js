/**
 * Savory menu data.
 *
 * To update the menu, edit this file only — the page builds the tabs and
 * dish cards from it automatically.
 *
 * Each dish:
 *   name, description, price (number), image (Unsplash photo id),
 *   tags (optional): "V" = vegetarian, "Spicy", "Signature", "GF" = gluten-free
 */
window.SAVORY_MENU = {
  categories: [
    { id: "all", label: "All" },
    { id: "starters", label: "Starters" },
    { id: "mains", label: "Mains" },
    { id: "pizza-pasta", label: "Pizza & Pasta" },
    { id: "desserts", label: "Desserts" },
    { id: "drinks", label: "Drinks" },
  ],

  items: [
    // ---- Starters ----
    {
      category: "starters",
      name: "Herb Meatballs",
      description: "Beef and pork meatballs, rocket, whipped ricotta and toasted sourdough crumb.",
      price: 14,
      image: "1529042410759-befb1204b468",
      tags: ["Signature"],
    },
    {
      category: "starters",
      name: "Smashed Avocado & Egg",
      description: "Soft-boiled egg, baby spinach, chilli oil and grilled country bread.",
      price: 13,
      image: "1482049016688-2d3e1b311543",
      tags: ["V"],
    },
    {
      category: "starters",
      name: "Garden Greens",
      description: "Shaved carrot, red onion, black olives, feta and lemon-herb vinaigrette.",
      price: 12,
      image: "1540189549336-e6e99c3679fe",
      tags: ["V", "GF"],
    },
    {
      category: "starters",
      name: "Grill Board to Share",
      description: "Flatbreads, charred vegetables, house dips and pickles for the table.",
      price: 18,
      image: "1476224203421-9ac39bcb3327",
      tags: [],
    },

    // ---- Mains ----
    {
      category: "mains",
      name: "Bavette Steak Frites",
      description: "Wood-grilled bavette, rosemary fries and peppercorn butter.",
      price: 34,
      image: "1600891964092-4316c288032e",
      tags: ["Signature", "GF"],
    },
    {
      category: "mains",
      name: "Smoked BBQ Ribs",
      description: "Twelve-hour smoked pork ribs, tomato salad and chipotle glaze.",
      price: 29,
      image: "1544025162-d76694265947",
      tags: ["Spicy"],
    },
    {
      category: "mains",
      name: "Savory Burger",
      description: "Dry-aged beef, aged cheddar, pickles and house sauce on a brioche bun.",
      price: 22,
      image: "1571091718767-18b5b1457add",
      tags: [],
    },
    {
      category: "mains",
      name: "Salmon Poke Bowl",
      description: "Seared salmon, cucumber, sweetcorn, red cabbage and sesame-ginger dressing.",
      price: 24,
      image: "1546069901-ba9599a7e63c",
      tags: ["GF"],
    },
    {
      category: "mains",
      name: "Rainbow Harvest Bowl",
      description: "Roasted chickpeas, avocado, sweet potato, pickled radish and tahini.",
      price: 19,
      image: "1512621776951-a57141f2eefd",
      tags: ["V", "GF"],
    },

    // ---- Pizza & Pasta ----
    {
      category: "pizza-pasta",
      name: "Wood-Fired Pizza",
      description: "San Marzano tomato, fior di latte, roasted pineapple, red onion and basil.",
      price: 21,
      image: "1565299624946-b28f40a0ae38",
      tags: ["V"],
    },
    {
      category: "pizza-pasta",
      name: "Penne all'Arrabbiata",
      description: "Hand-rolled penne, slow-cooked tomato, Calabrian chilli and parmesan.",
      price: 20,
      image: "1621996346565-e3dbc646d9a9",
      tags: ["V", "Spicy"],
    },
    {
      category: "pizza-pasta",
      name: "Farfalle Pesto Verde",
      description: "Basil pesto, cherry tomatoes, toasted pine nuts and pecorino.",
      price: 19,
      image: "1473093295043-cdd812d0e601",
      tags: ["V"],
    },

    // ---- Desserts ----
    {
      category: "desserts",
      name: "Strawberry Panna Cotta",
      description: "Vanilla bean cream, macerated strawberries and shortbread crumble.",
      price: 11,
      image: "1488477181946-6428a0291777",
      tags: ["V", "Signature"],
    },
    {
      category: "desserts",
      name: "Chocolate Cookie Sundae",
      description: "Dark chocolate mousse, cookie crumb, salted caramel and whipped cream.",
      price: 12,
      image: "1563805042-7684c019e1cb",
      tags: ["V"],
    },
    {
      category: "desserts",
      name: "Glazed Doughnut Stack",
      description: "Warm brioche doughnuts, chocolate glaze and sprinkles. Made to share.",
      price: 10,
      image: "1551024601-bec78aea704b",
      tags: ["V"],
    },

    // ---- Drinks ----
    {
      category: "drinks",
      name: "Savory Old Fashioned",
      description: "Bourbon, demerara, orange bitters and a flamed orange peel.",
      price: 15,
      image: "1470337458703-46ad1756a187",
      tags: ["Signature"],
    },
    {
      category: "drinks",
      name: "Smoked Rosemary Sour",
      description: "Rye whiskey, lemon, honey and rosemary smoke.",
      price: 16,
      image: "1514362545857-3bc16c4c7d1b",
      tags: [],
    },
  ],
};
