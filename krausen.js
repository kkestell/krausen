function BeerRecipe(attrs) {
  var self = this;

  for(var i in attrs) {
    this[i] = attrs[i];
  }

  function round(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }

  function sg(volume) {
    var points = 0;
    for(var i in self.fermentables) {
      var f = self.fermentables[i];

      // Grains don't contribute gravity in extract recipes
      if(self.recipe_type === '' || (self.recipe_type === 'Extract' && f.type === 'Grain')) {
        continue;
      }

      // Calculate point contribution
      pc = f.ppg * f.amount;

      // Apply efficiency for grains (extracts assume 100% efficiency)
      if(f.type === 'Grain') {
        pc *= (self.efficiency / 100);
      }

      // Calculate gravity points
      points += pc * (1 / volume);
    }

    // Convert PPG to potential (20 -> 1.020)
    return (points / 1000) + 1;
  }

  function boil_sg() {
    // Assume average volume
    return sg((self.boil_size + self.batch_size) / 2);
  }

  this.calculate_boil_size = function(batch_size) {
    if(!batch_size) {
      batch_size = self.batch_size;
    }
    return (batch_size - self.top_up_water_volume) / (1 - (self.evaporation_rate / 100) * self.boil_time / 60);
  }

  this.og = function() {
    return sg(self.batch_size);
  }

  this.fg = function() {
    var og = self.og();
    // FIXME: Support multiple yeasts
    if(!this.attenuation) {
      return 1.0;
    }
    op = (og - 1) * 1000
    fp = op * (1 - (this.attenuation / 100));
    return (fp / 1000) + 1;
  }

  this.abv = function() {
    return (this.og() - this.fg()) * 131
  }

  this.ibu = function() {
    if(this.recipe_type === '') {
      return 0;
    }
    var ibu = 0;
    for(var i in self.hops) {
      var h = self.hops[i];
      if(h.hop_use !== 'Dry Hop') {
        var aau = h.amount * (h.alpha / 100) * 100;
        var g = 1.65 * Math.pow(0.000125, boil_sg() - 1);
        var t = (1 - Math.pow(Math.E, -0.04 * h.time)) / 4.15;
        var u = g * t;
        ibu += aau * u * 75 / self.batch_size
      }
    }
    return ibu;
  }

  this.color = function() {
    var mcu = 0;
    for(var i in self.fermentables) {
      var f = self.fermentables[i];
      mcu += (f.color * f.amount) / self.batch_size;
    }
    return 1.4922 * Math.pow(mcu, 0.6859);
  }

  this.balance = function() {
    if(this.recipe_type === '') {
      return 0.5;
    }
    var balance = this.ibu() / ((this.og() - 1.0) * 1000.0);
    if(balance === Infinity) {
      return 1.0;
    }
    return balance;
  }
}