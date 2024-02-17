import React, {Fragment, useEffect, useRef} from 'react';
import {Mattris} from "./Mattris";
import "./mattris.css";

export const MattrisHome = () => {

    const gameRef = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.CENTER_BOTH,
                parent: gameRef.current,
                width: 500,
                height: 800
            },
            scene: Mattris
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <Fragment>
            <div className={"row justify-content-center"}>
                <div className={"col col-md-9 col-lg-7 col-xl-5"}>
                    <div ref={gameRef}></div>
                </div>
            </div>
        </Fragment>
    );
};
