
        
        function loadGameObjects(ssList, objList) {
            
            {
                var f = new WAECore.Frame({
                    spriteSheet: ssList[0],
                    cell: { row: 5, col: 0, rowSpan: 1, colSpan: 1 },
                    center: { x: 8, y: 8 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrame(0, f, 10);
                var obj = new WAECore.StoredObject({
                    oid: 0,
                    type: 0,
                    name: 'Fighter'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 1,
                    type: 0,
                    name: 'Balloon'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 2,
                    type: 0,
                    name: 'Coin'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 2,
                    type: 0,
                    name: 'Biter'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 4,
                    type: 0,
                    name: 'Bear'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }

            {
                var f0 = new WAECore.Frame({
                    spriteSheet: ssList[0],
                    cell: { row: 5, col: 1, rowSpan: 1, colSpan: 1 },
                    center: { x: 8, y: 8 }
                });
                var anim0 = new WAECore.Animation({
                    name: 'Fly',
                    next: 0
                });
                anim0.addFrame(0, f0, 10);
                var fArr1 = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 3, rowSpan: 2, colSpan: 2 },
                        center: { x: 16, y: 16 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 5, rowSpan: 2, colSpan: 2 },
                        center: { x: 16, y: 16 }
                    })
                ];
                var anim1 = new WAECore.Animation({
                    name: 'Explode',
                    next: null
                });
                anim1.addFrameByArray(fArr1, [3, 6, 9, 12, 15]);
                var obj = new WAECore.StoredObject({
                    oid: 5,
                    type: 0,
                    name: 'Bullet'
                });
                obj.addAnimation(0, anim0);
                obj.addAnimation(1, anim1);
                objList[obj.oid] = obj;
            }
            
        }

        function initGameplay(objList) {
            
            t_Scene = new WAECore.Scene('TestScene');
            
            t_Scene.player = new WAECore.Sprite({
                object: objList[0],
                action: 0,
                team: 0,
                position: { x: 0, y: -250 },
                scale: 2
            });
            t_Scene.player.cooldown = 0;
            t_Scene.addSpriteToLayer(0, t_Scene.player);
            
            var enemy_1 = new WAECore.Sprite({
                object: objList[1],
                action: 0,
                team: 1,
                position: { x: 50, y: -100 },
                scale: 2
            });
            t_Scene.addSpriteToLayer(0, enemy_1);
            
            var enemy_1_ai = new WAECore.AI();
            enemy_1_ai.target = t_Scene.player;
            enemy_1_ai.execute = function () {
                if (this.self.position.x > this.target.position.x) {
                    this.self.velocity.x = -1;
                }
                else if (this.self.position.x < this.target.position.x) {
                    this.self.velocity.x = 1;
                }
                else {
                    this.self.velocity.x = 0;
                }
            }
            
            enemy_1.setAI(enemy_1_ai);
            
            /*
            t_Scene.addSpriteToLayer(0, new WAECore.Sprite({
                object: objList[2],
                action: 0,
                team: 0,
                position: { x: 156, y: 300 },
                scale: 2
            }));
            t_Scene.addSpriteToLayer(0, new WAECore.Sprite({
                object: objList[3],
                action: 0,
                team: 0,
                position: { x: 188, y: 300 },
                scale: 2
            }));
            t_Scene.addSpriteToLayer(0, new WAECore.Sprite({
                object: objList[4],
                action: 0,
                team: 0,
                position: { x: 220, y: 300 },
                scale: 2
            }));
            */
        }
