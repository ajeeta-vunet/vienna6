define(function () {
  return {
  "rows": [
    {
      "geoJson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                22.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 39,
              "geohash": "s",
              "center": [
                22.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "s",
                  "value": "s",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 39,
                "value": 39,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  0,
                  0
                ],
                [
                  45,
                  0
                ],
                [
                  45,
                  45
                ],
                [
                  0,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                112.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 31,
              "geohash": "w",
              "center": [
                112.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "w",
                  "value": "w",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 31,
                "value": 31,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  90,
                  0
                ],
                [
                  135,
                  0
                ],
                [
                  135,
                  45
                ],
                [
                  90,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 30,
              "geohash": "d",
              "center": [
                -67.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "d",
                  "value": "d",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 30,
                "value": 30,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  0
                ],
                [
                  -45,
                  0
                ],
                [
                  -45,
                  45
                ],
                [
                  -90,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -112.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 25,
              "geohash": "9",
              "center": [
                -112.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "9",
                  "value": "9",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 25,
                "value": 25,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -135,
                  0
                ],
                [
                  -90,
                  0
                ],
                [
                  -90,
                  45
                ],
                [
                  -135,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                67.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 23,
              "geohash": "t",
              "center": [
                67.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "t",
                  "value": "t",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 23,
                "value": 23,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  45,
                  0
                ],
                [
                  90,
                  0
                ],
                [
                  90,
                  45
                ],
                [
                  45,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                22.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 23,
              "geohash": "k",
              "center": [
                22.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "k",
                  "value": "k",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 23,
                "value": 23,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  0,
                  -45
                ],
                [
                  45,
                  -45
                ],
                [
                  45,
                  0
                ],
                [
                  0,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 22,
              "geohash": "6",
              "center": [
                -67.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "6",
                  "value": "6",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 22,
                "value": 22,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  -45
                ],
                [
                  -45,
                  -45
                ],
                [
                  -45,
                  0
                ],
                [
                  -90,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                22.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 20,
              "geohash": "u",
              "center": [
                22.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "u",
                  "value": "u",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 20,
                "value": 20,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  0,
                  45
                ],
                [
                  45,
                  45
                ],
                [
                  45,
                  90
                ],
                [
                  0,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                67.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 18,
              "geohash": "v",
              "center": [
                67.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "v",
                  "value": "v",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 18,
                "value": 18,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  45,
                  45
                ],
                [
                  90,
                  45
                ],
                [
                  90,
                  90
                ],
                [
                  45,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                157.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 11,
              "geohash": "r",
              "center": [
                157.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "r",
                  "value": "r",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 11,
                "value": 11,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  135,
                  -45
                ],
                [
                  180,
                  -45
                ],
                [
                  180,
                  0
                ],
                [
                  135,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -22.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 11,
              "geohash": "e",
              "center": [
                -22.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "e",
                  "value": "e",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 11,
                "value": 11,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -45,
                  0
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  45
                ],
                [
                  -45,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                112.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 10,
              "geohash": "y",
              "center": [
                112.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "y",
                  "value": "y",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 10,
                "value": 10,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  90,
                  45
                ],
                [
                  135,
                  45
                ],
                [
                  135,
                  90
                ],
                [
                  90,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -112.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 10,
              "geohash": "c",
              "center": [
                -112.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "c",
                  "value": "c",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 10,
                "value": 10,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -135,
                  45
                ],
                [
                  -90,
                  45
                ],
                [
                  -90,
                  90
                ],
                [
                  -135,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 8,
              "geohash": "f",
              "center": [
                -67.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "f",
                  "value": "f",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 8,
                "value": 8,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  45
                ],
                [
                  -45,
                  45
                ],
                [
                  -45,
                  90
                ],
                [
                  -90,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -22.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 8,
              "geohash": "7",
              "center": [
                -22.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "7",
                  "value": "7",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 8,
                "value": 8,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -45,
                  -45
                ],
                [
                  0,
                  -45
                ],
                [
                  0,
                  0
                ],
                [
                  -45,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                112.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 6,
              "geohash": "q",
              "center": [
                112.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "q",
                  "value": "q",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 6,
                "value": 6,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  90,
                  -45
                ],
                [
                  135,
                  -45
                ],
                [
                  135,
                  0
                ],
                [
                  90,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -22.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 6,
              "geohash": "g",
              "center": [
                -22.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "g",
                  "value": "g",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 6,
                "value": 6,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -45,
                  45
                ],
                [
                  0,
                  45
                ],
                [
                  0,
                  90
                ],
                [
                  -45,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                157.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 4,
              "geohash": "x",
              "center": [
                157.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "x",
                  "value": "x",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 4,
                "value": 4,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  135,
                  0
                ],
                [
                  180,
                  0
                ],
                [
                  180,
                  45
                ],
                [
                  135,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -157.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 3,
              "geohash": "b",
              "center": [
                -157.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "b",
                  "value": "b",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 3,
                "value": 3,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -180,
                  45
                ],
                [
                  -135,
                  45
                ],
                [
                  -135,
                  90
                ],
                [
                  -180,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                157.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 2,
              "geohash": "z",
              "center": [
                157.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "z",
                  "value": "z",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 2,
                "value": 2,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  135,
                  45
                ],
                [
                  180,
                  45
                ],
                [
                  180,
                  90
                ],
                [
                  135,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                -67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 2,
              "geohash": "4",
              "center": [
                -67.5,
                -67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "4",
                  "value": "4",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 2,
                "value": 2,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  -90
                ],
                [
                  -45,
                  -90
                ],
                [
                  -45,
                  -45
                ],
                [
                  -90,
                  -45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -22.5,
                -67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 1,
              "geohash": "5",
              "center": [
                -22.5,
                -67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "5",
                  "value": "5",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 1,
                "value": 1,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -45,
                  -90
                ],
                [
                  0,
                  -90
                ],
                [
                  0,
                  -45
                ],
                [
                  -45,
                  -45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -112.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 1,
              "geohash": "3",
              "center": [
                -112.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "CN",
                    "value": "CN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "3",
                  "value": "3",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 1,
                "value": 1,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -135,
                  -45
                ],
                [
                  -90,
                  -45
                ],
                [
                  -90,
                  0
                ],
                [
                  -135,
                  0
                ]
              ]
            }
          }
        ],
        "properties": {
          "label": "Top 2 geo.dest: CN",
          "length": 23,
          "min": 1,
          "max": 39,
          "precision": 1
        }
      },
      "label": "Top 2 geo.dest: CN"
    },
    {
      "geoJson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 31,
              "geohash": "6",
              "center": [
                -67.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "6",
                  "value": "6",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 31,
                "value": 31,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  -45
                ],
                [
                  -45,
                  -45
                ],
                [
                  -45,
                  0
                ],
                [
                  -90,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                22.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 30,
              "geohash": "s",
              "center": [
                22.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "s",
                  "value": "s",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 30,
                "value": 30,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  0,
                  0
                ],
                [
                  45,
                  0
                ],
                [
                  45,
                  45
                ],
                [
                  0,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                112.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 29,
              "geohash": "w",
              "center": [
                112.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "w",
                  "value": "w",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 29,
                "value": 29,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  90,
                  0
                ],
                [
                  135,
                  0
                ],
                [
                  135,
                  45
                ],
                [
                  90,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 28,
              "geohash": "d",
              "center": [
                -67.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "d",
                  "value": "d",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 28,
                "value": 28,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  0
                ],
                [
                  -45,
                  0
                ],
                [
                  -45,
                  45
                ],
                [
                  -90,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                67.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 25,
              "geohash": "t",
              "center": [
                67.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "t",
                  "value": "t",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 25,
                "value": 25,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  45,
                  0
                ],
                [
                  90,
                  0
                ],
                [
                  90,
                  45
                ],
                [
                  45,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                22.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 24,
              "geohash": "k",
              "center": [
                22.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "k",
                  "value": "k",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 24,
                "value": 24,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  0,
                  -45
                ],
                [
                  45,
                  -45
                ],
                [
                  45,
                  0
                ],
                [
                  0,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                22.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 20,
              "geohash": "u",
              "center": [
                22.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "u",
                  "value": "u",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 20,
                "value": 20,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  0,
                  45
                ],
                [
                  45,
                  45
                ],
                [
                  45,
                  90
                ],
                [
                  0,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -112.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 18,
              "geohash": "9",
              "center": [
                -112.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "9",
                  "value": "9",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 18,
                "value": 18,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -135,
                  0
                ],
                [
                  -90,
                  0
                ],
                [
                  -90,
                  45
                ],
                [
                  -135,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                67.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 14,
              "geohash": "v",
              "center": [
                67.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "v",
                  "value": "v",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 14,
                "value": 14,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  45,
                  45
                ],
                [
                  90,
                  45
                ],
                [
                  90,
                  90
                ],
                [
                  45,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -22.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 11,
              "geohash": "e",
              "center": [
                -22.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "e",
                  "value": "e",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 11,
                "value": 11,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -45,
                  0
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  45
                ],
                [
                  -45,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                157.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 9,
              "geohash": "r",
              "center": [
                157.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "r",
                  "value": "r",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 9,
                "value": 9,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  135,
                  -45
                ],
                [
                  180,
                  -45
                ],
                [
                  180,
                  0
                ],
                [
                  135,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                112.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 6,
              "geohash": "y",
              "center": [
                112.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "y",
                  "value": "y",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 6,
                "value": 6,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  90,
                  45
                ],
                [
                  135,
                  45
                ],
                [
                  135,
                  90
                ],
                [
                  90,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 6,
              "geohash": "f",
              "center": [
                -67.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "f",
                  "value": "f",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 6,
                "value": 6,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  45
                ],
                [
                  -45,
                  45
                ],
                [
                  -45,
                  90
                ],
                [
                  -90,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -22.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 5,
              "geohash": "g",
              "center": [
                -22.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "g",
                  "value": "g",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 5,
                "value": 5,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -45,
                  45
                ],
                [
                  0,
                  45
                ],
                [
                  0,
                  90
                ],
                [
                  -45,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -112.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 5,
              "geohash": "c",
              "center": [
                -112.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "c",
                  "value": "c",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 5,
                "value": 5,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -135,
                  45
                ],
                [
                  -90,
                  45
                ],
                [
                  -90,
                  90
                ],
                [
                  -135,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -157.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 4,
              "geohash": "b",
              "center": [
                -157.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "b",
                  "value": "b",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 4,
                "value": 4,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -180,
                  45
                ],
                [
                  -135,
                  45
                ],
                [
                  -135,
                  90
                ],
                [
                  -180,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                112.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 3,
              "geohash": "q",
              "center": [
                112.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "q",
                  "value": "q",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 3,
                "value": 3,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  90,
                  -45
                ],
                [
                  135,
                  -45
                ],
                [
                  135,
                  0
                ],
                [
                  90,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -67.5,
                -67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 2,
              "geohash": "4",
              "center": [
                -67.5,
                -67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "4",
                  "value": "4",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 2,
                "value": 2,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -90,
                  -90
                ],
                [
                  -45,
                  -90
                ],
                [
                  -45,
                  -45
                ],
                [
                  -90,
                  -45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                157.5,
                67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 1,
              "geohash": "z",
              "center": [
                157.5,
                67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "z",
                  "value": "z",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 1,
                "value": 1,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  135,
                  45
                ],
                [
                  180,
                  45
                ],
                [
                  180,
                  90
                ],
                [
                  135,
                  90
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                157.5,
                22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 1,
              "geohash": "x",
              "center": [
                157.5,
                22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "x",
                  "value": "x",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 1,
                "value": 1,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  135,
                  0
                ],
                [
                  180,
                  0
                ],
                [
                  180,
                  45
                ],
                [
                  135,
                  45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                157.5,
                -67.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 1,
              "geohash": "p",
              "center": [
                157.5,
                -67.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "p",
                  "value": "p",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 1,
                "value": 1,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  135,
                  -90
                ],
                [
                  180,
                  -90
                ],
                [
                  180,
                  -45
                ],
                [
                  135,
                  -45
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                67.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 1,
              "geohash": "m",
              "center": [
                67.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "m",
                  "value": "m",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 1,
                "value": 1,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  45,
                  -45
                ],
                [
                  90,
                  -45
                ],
                [
                  90,
                  0
                ],
                [
                  45,
                  0
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -22.5,
                -22.5
              ]
            },
            "properties": {
              "valueLabel": "Count",
              "count": 1,
              "geohash": "7",
              "center": [
                -22.5,
                -22.5
              ],
              "aggConfigResult": {
                "$parent": {
                  "$parent": {
                    "$parent": null,
                    "key": "IN",
                    "value": "IN",
                    "aggConfig": {
                      "id": "3",
                      "type": "terms",
                      "schema": "split",
                      "params": {
                        "field": "geo.dest",
                        "size": 2,
                        "order": "desc",
                        "orderBy": "1",
                        "row": true
                      }
                    },
                    "type": "bucket"
                  },
                  "key": "7",
                  "value": "7",
                  "aggConfig": {
                    "id": "2",
                    "type": "geohash_grid",
                    "schema": "segment",
                    "params": {
                      "field": "geo.coordinates",
                      "precision": 1
                    }
                  },
                  "type": "bucket"
                },
                "key": 1,
                "value": 1,
                "aggConfig": {
                  "id": "1",
                  "type": "count",
                  "schema": "metric",
                  "params": {}
                },
                "type": "metric"
              },
              "rectangle": [
                [
                  -45,
                  -45
                ],
                [
                  0,
                  -45
                ],
                [
                  0,
                  0
                ],
                [
                  -45,
                  0
                ]
              ]
            }
          }
        ],
        "properties": {
          "label": "Top 2 geo.dest: IN",
          "length": 23,
          "min": 1,
          "max": 31,
          "precision": 1
        }
      },
      "label": "Top 2 geo.dest: IN"
    }
  ],
  "hits": 1639
};
});

