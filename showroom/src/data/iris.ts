import irisData from '@/data/iris.csv?raw';

export interface IrisSpicies {
    sepalLength: number[];
    sepalWidth: number[];
    petalLength: number[];
    petalWidth: number[];
}

export interface IrisData {
    setosa: IrisSpicies;
    versicolor: IrisSpicies;
    virginica: IrisSpicies;
}

function emptySpicies(): IrisSpicies {
    return {
        sepalLength: [],
        sepalWidth: [],
        petalLength: [],
        petalWidth: [],
    };
}

export function prepareIrisData(): IrisData {
    const lines = irisData.trim().split('\n');
    if (typeof lines[0] !== 'string') {
        throw new Error('Failed to parse iris data');
    }
    const data: IrisData = {
        setosa: emptySpicies(),
        versicolor: emptySpicies(),
        virginica: emptySpicies(),
    };
    const header = lines[0].split(',');
    const spiciesIndex = header.indexOf('Species');
    if (spiciesIndex === -1) {
        throw new Error('Failed to parse iris data: missing Species column');
    }
    for (const line of lines.slice(1)) {
        const values = line.split(',');
        let spicies: IrisSpicies | undefined;
        switch (values[spiciesIndex]) {
            case 'Iris-setosa':
                spicies = data.setosa;
                break;
            case 'Iris-versicolor':
                spicies = data.versicolor;
                break;
            case 'Iris-virginica':
                spicies = data.virginica;
                break;
        }
        if (!spicies) {
            throw new Error(`Failed to parse iris data: unknown species ${values[spiciesIndex]}`);
        }
        header.forEach((h, i) => {
            const value = values[i];
            if (value !== undefined) {
                switch (h) {
                    case 'SepalLengthCm':
                        spicies.sepalLength.push(parseFloat(value));
                        break;
                    case 'SepalWidthCm':
                        spicies.sepalWidth.push(parseFloat(value));
                        break;
                    case 'PetalLengthCm':
                        spicies.petalLength.push(parseFloat(value));
                        break;
                    case 'PetalWidthCm':
                        spicies.petalWidth.push(parseFloat(value));
                        break;
                }
            }
        });
    }
    return data;
}