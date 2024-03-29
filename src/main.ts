import _ from 'lodash'
import Car from './car';
import NeuralNetwork from './network';
import Road from './road';
import Visualizer from './visualizer';

const carCanvas: HTMLCanvasElement = document.getElementById('carCanvas') as HTMLCanvasElement;
carCanvas.width = 200;

const networkCanvas: HTMLCanvasElement = document.getElementById('networkCanvas') as HTMLCanvasElement;
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

//const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];

if (localStorage.getItem('bestBrain')) {
    for (let i = 0; i < cars.length; i++) {
        if (i < 1) {
            cars[i].brain = JSON.parse(
                // @ts-ignore
                localStorage.getItem('bestBrain')
            );
        } else if (i <= 50) {
            // @ts-ignore
            NeuralNetwork.mutate(cars[i].brain, 0.0015);
        } else if (i > 50) {
            // @ts-ignore
            NeuralNetwork.mutate(cars[i].brain, 0.01);
        }
    }
}

function getRandomLane(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
]

const totalTraffic = 100;
let trafficY = 100;
for (let i = 0; i <= totalTraffic; i++) {
    trafficY += 200;
    traffic.push(
        new Car(road.getLaneCenter(getRandomLane(0, 3)), -trafficY, 30, 50, "DUMMY", 2)
    );
    traffic.push(
        new Car(road.getLaneCenter(getRandomLane(0, 3)), -trafficY, 30, 50, "DUMMY", 2)
    );
}

// @ts-ignore
animate();

document.getElementById("save")?.addEventListener("click", () => save());
document.getElementById("discard")?.addEventListener("click", () => discard());

function save() {
    console.log('saved');
    localStorage.setItem('bestBrain',
        JSON.stringify(bestCar.brain));
}

function discard() {
    console.log('discarded');
    localStorage.removeItem('bestBrain');
}

function generateCars(N: number) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time: any) {
    if (!carCtx) {
        return;
    }

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    // @ts-ignore
    bestCar = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        )
    );

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7)

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    carCtx.globalAlpha = 0.2;

    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }

    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);

    carCtx.restore();

    if (bestCar.brain && networkCtx) {
        networkCtx.lineDashOffset = -time / 50;
        Visualizer.drawNetwork(networkCtx, bestCar.brain);
    }
    requestAnimationFrame(animate);
}
