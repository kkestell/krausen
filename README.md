# Krausen

Krausen, pronounced "KROY-zen", is a beer recipe emulator written in JavaScript.

## Features

Given a JSON object representing the recipe, Krausen can predict the following properties of the beer:

* Original gravity (OG)
* Final gravity (FG)
* Color (°L)
* Bitterness (IBUs)
* Alcohol by volume (ABV)
* Bitterness ratio (Balance)

Krausen can also calculate boil size based on batch size, evaporation rate, boil time, and top up water.

## Example

```javascript
var recipeJson = {
  "batch_size":       5.5,         // Gallons
  "efficiency":       75,          // Percent
  "evaporation_rate": 20,          // Percent
  "boil_time":        60,          // Minutes
  "top_up_water":     0,           // Gallons
  "attenuation":      75,          // Percent
  "recipe_type":      "All Grain", // "All Grain", "Partial Mash", or "Extract"
  "fermentables": [
    {
      "amount": 9.25,              // Pounds
      "ppg":    36,                // PPG
      "color":  1,                 // Degrees Lovibond
      "type":   "Grain"            // "Grain", "Sugar", "Extract", "Dry Extract",
                                   // or "Adjunct"
    }
  ],
  "hops": [
    {
      "time":    60,               // Minutes
      "amount":  1.5,              // Ounces
      "alpha":   8.75,             // Percent
      "hop_use": "Boil"            // "Boil", "Dry Hop", "Mash", "First Wort",
                                   // or "Aroma"
    }
  ]
};

var recipe = new BeerRecipe(recipeJson);

recipe.og();
recipe.fg();
recipe.color();
recipe.ibu();
recipe.abv();
recipe.balance();
recipe.boil_size();
```

## License

Copyright (c) 2012-2013 Kyle Kestell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
