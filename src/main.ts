import _ from 'lodash'
import Car from './car';
import Road from './road';
import Visualizer from './visualizer';

const carCanvas: HTMLCanvasElement = document.getElementById('carCanvas') as HTMLCanvasElement;
carCanvas.width = 200;

const networkCanvas: HTMLCanvasElement = document.getElementById('networkCanvas') as HTMLCanvasElement;
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
]

animate();

function animate(time: any) {
    if (!carCtx) {
        return;
    }

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    car.update(road.borders, traffic);

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -car.y + carCanvas.height * 0.7)

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    car.draw(carCtx, "blue");
    carCtx.restore();

    if (car.brain && networkCtx) {
        networkCtx.lineDashOffset = -time / 50;
        Visualizer.drawNetwork(networkCtx, car.brain);
    }
    requestAnimationFrame(animate);
}
