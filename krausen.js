function BeerRecipe(attrs) {
  var self = this;

  for(var i in attrs) {
    this[i] = attrs[i];
  }

  normalizeAttributes();

  if(typeof this.batch_size !== 'number') {
    // console.log('Batch size must be a number');
    this.batch_size = 5.0;
  }

  if(typeof this.efficiency  !== 'number') {
    // console.log('Efficiency must be a number');
    this.efficiency = 75;
  }

  if(typeof this.evaporation_rate !== 'number') {
    // console.log('Evaporation rate must be a number');
    this.evaporation_rate = 20;
  }

  if(typeof this.boil_size  !== 'number') {
    // console.log('Boil size must be a number');
    this.boil_size = 6.25;
  }

  if(typeof this.attenuation !== 'number') {
    // console.log('Attenuation must be a number');
    this.attenuation = 70;
  }

  function round(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }

  function normalizeValue(value) {
    if(typeof value === 'number') {
      return value;
    } else if(typeof value === 'undefined') {
      return undefined;
    }

    parts = value.split(' ');

    if(parts.length === 1) {
      return parseFloat(value);
    }

    if(parts.length !== 2) {
      // console.log('Normalization error: ' + value);
      return 0;
    } else {
      value = parseFloat(parts[0]);
      units = parts[1];
    }

    if(units === 'lbs' || units === 'oz' || units === 'gal' || units === '%' || units === 'min') {
      return value;
    }

    switch(units) {
      case 'kg':
        return round(value * 2.20462262, 2);
        break;
      case 'g':
        return round(value * 0.03527396, 2);
        break;
      case 'L':
        return round(value * 0.26417205, 2);
      default:
        // console.log('Unknown unit: ' + units);
        return 0;
    }
  }

  function normalizeAttributes() {
    self.batch_size       = normalizeValue(self.batch_size);
    self.efficiency       = normalizeValue(self.efficiency);
    self.evaporation_rate = normalizeValue(self.evaporation_rate);
    self.boil_time        = normalizeValue(self.boil_time);
    self.boil_size        = normalizeValue(self.boil_size);
    self.attenuation      = normalizeValue(self.attenuation);

    for(var i in self.fermentables) {
      self.fermentables[i].amount = normalizeValue(self.fermentables[i].amount);
    }

    for(var i in self.hops) {
      self.hops[i].amount = normalizeValue(self.hops[i].amount);
      self.hops[i].time   = normalizeValue(self.hops[i].time);
      self.hops[i].alpha  = normalizeValue(self.hops[i].alpha);
    }
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
    return batch_size / (1 - (self.evaporation_rate / 100) * self.boil_time / 60);
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