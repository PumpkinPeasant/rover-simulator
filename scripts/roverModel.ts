import * as THREE from 'three'

const roverModel = (model: THREE.Group, scene: THREE.Scene, camera: THREE.Camera) => {
    const rotationConst: number = 0.02; //Единица поворота ровера
    let wheels: THREE.Object3D[];

    scene.add(model)

    wheels = getMesh(model, 'WHEEL')
    console.log(wheels)
    window.addEventListener('keydown', e => onKeyDown(e))

    // window.addEventListener('keyup', e => onKeyUp(e))


    function getMesh(model: THREE.Group, meshName: string) {
        let meshes: THREE.Object3D[] = []
        model.traverse(child => {
            child.name.includes(meshName) ? meshes.push(child) : null;
        })
        return meshes;
    }

    let velocity = 0;  // Текущая скорость
    let acceleration = 0.005;  // Ускорение при нажатии клавиши
    let maxSpeed = 0.3;  // Максимальная скорость
    let deceleration = 0.01;  // Коэффициент торможения (замедления)
    let braking = false;  // Флаг торможения

// Обработка нажатия клавиш
    function onKeyDown(e: KeyboardEvent) {
        switch (e.code) {
            // Forward
            case 'KeyW': {
                if (velocity < maxSpeed) {
                    velocity += acceleration;  // Увеличиваем скорость
                }
                break;
            }
            // Turn Right
            case 'KeyD': {
                model.rotation.y -= rotationConst;  // Поворот вправо
                break;
            }
            // Turn Left
            case 'KeyA': {
                model.rotation.y += rotationConst;  // Поворот влево
                break;
            }
            // Brake (Move Backward)
            case 'KeyS': {
                if (velocity > -maxSpeed) {
                    velocity -= acceleration;  // Уменьшаем скорость (движение назад)
                }
                break;
            }
        }
    }

// Обработка отпускания клавиш (для торможения)
    function onKeyUp(e: KeyboardEvent) {
        switch (e.code) {
            case 'KeyW':
            case 'KeyS': {
                braking = true;  // Устанавливаем флаг торможения
                break;
            }
        }
    }

// Функция для обновления положения ровера с учетом скорости и торможения
    function updatePosition() {
        // Если ровер не движется, применяем торможение
        if (braking) {
            if (velocity > 0) {
                velocity -= deceleration;  // Тормозим при движении вперед
                if (velocity < 0) velocity = 0;  // Останавливаем ровер
            } else if (velocity < 0) {
                velocity += deceleration;  // Тормозим при движении назад
                if (velocity > 0) velocity = 0;  // Останавливаем ровер
            }

            // Если скорость равна 0, снимаем флаг торможения
            if (velocity === 0) {
                braking = false;
            }
        }

        // Обновляем позицию ровера на основе текущей скорости
        model.position.z += Math.sin(model.rotation.y) * velocity;
        model.position.x += Math.cos(model.rotation.y) * -velocity;
    }

    function update() {
        updatePosition()
        // Обновляем положение камеры
    }

    const clock = new THREE.Clock;
    (function animate() {
        let delta = clock.getDelta();
        update();
        requestAnimationFrame(animate);
    })();
}

export default roverModel