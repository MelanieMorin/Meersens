# Meersens - test technique


3 routes disponibles : 


## /
Renvoie la liste des règles de surveillance créées


## /create
Permet de créer et stocker une règle. Format d'input :
```
{
  "_id":"...",
  "name":"Healthy rule",
  "description":"Alert when Ozone is too high with high temperature",
  "organization":"ACME Enterprise",
  "criteria":[
    {
        "$date": {
          "after":"2022-01-01",
          "before":"2024-12-31"
        }
    },
    {
      "$air": {
        "o3": {
          "lt":60
        }
      }
    },
    {
      "$weather": {
        "temperature": {
          "gt":18
        }
      }
    }
  ]
}
```


## /watch
Permet de surveiller les données en temps réelles remontées par les API Meersens de qualité d'air, d'eau et de données météo. Format d'input :
```
{
  "name": "Healthy rule",
  "coordinates": { "lat": 48.8534, "lng": 2.3488 }
}
```

Format de retour si aucune alerte à remonter :
```
{
  "status": "ALERT"
}

```

Format de retour en cas d'alerte :
```
{
  "status": "OK"
}

```
