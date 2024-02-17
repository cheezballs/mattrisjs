const GravityBreakpoints = [
    {
        10: {
            gravity: 1
        },
        20: {
            gravity: .75
        },
        30: {
            gravity: .5
        },
        40: {
            gravity: .3
        },
        50: {
            gravity: .2
        },
        60: {
            gravity: .1
        }
    }
];

const findGravityForLines = (lines) => {
    const keys = Object.keys(GravityBreakpoints).map(Number).sort((a, b) => a - b);
    let gravityValue;

    for (let i = 0; i < keys.length; i++) {
        if (lines <= keys[i]) {
            gravityValue = GravityBreakpoints[keys[i]].gravity;
            break;
        }
    }

    if (gravityValue === null && keys.length > 0) {
        gravityValue = GravityBreakpoints[keys[keys.length - 1]].gravity;
    }
    // todo: fix all this
    return 1;
}

export {findGravityForLines}