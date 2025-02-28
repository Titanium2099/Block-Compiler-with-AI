import React from 'react';
import { FormattedMessage } from 'react-intl';

// Tutorial thumbnails: Avoid using any text that would need to be
// translated in thumbnails.
// Intro

// Animate A Character
import libraryAnimateChar from './thumbnails/animate-a-character.jpg';

const { AI_HOST } = require('../../brand');


export const CATEGORIES = {
    gettingStarted: 'gettingStarted',
    basics: 'basics',
    intermediate: 'intermediate',
    prompts: 'prompts'
};

export default {

    Torchy: {
        name: (
            <FormattedMessage
                defaultMessage="Using Torchy"
                description="Name for the 'Using Torchy' tutorial"
                id="gui.howtos.ai-getting-started.name"
            />
        ),
        img: libraryAnimateChar,
        category: CATEGORIES.gettingStarted,
        steps: [
            {
                video: AI_HOST + '/opening-popup.mp4',
                title: (
                    <FormattedMessage
                        defaultMessage="Open the Torchy Popup"
                        description="Step name for 'Add a Sprite' step"
                        id="gui.howtos.animate-char.open-torchy"
                    />
                ),
            }
        ],
        urlId: 'torchy'
    }
};


/* {
            video: 's228u3g5u9'
        },
        {
            title: (
                <FormattedMessage
                    defaultMessage="Add a Backdrop"
                    description="Step name for 'Add a Backdrop' step"
                    id="gui.howtos.animate-char.step_addbg"
                />
            ),
            image: 'animateCharPickBackdrop'
        }, {
            title: (
                <FormattedMessage
                    defaultMessage="Add a Sprite"
                    description="Step name for 'Add a Sprite' step"
                    id="gui.howtos.animate-char.step_addsprite"
                />
            ),
            image: 'animateCharPickSprite'
        }, {
            title: (
                <FormattedMessage
                    defaultMessage="Say Something"
                    description="Step name for 'Say Something' step"
                    id="gui.howtos.animate-char.step_saysomething"
                />
            ),
            image: 'animateCharSaySomething'
        }, {
            title: (
                <FormattedMessage
                    defaultMessage="Add Sound"
                    description="Step name for 'Add Sound' step"
                    id="gui.howtos.animate-char.step_addsound"
                />
            ),
            image: 'animateCharAddSound'
        }, {
            title: (
                <FormattedMessage
                    defaultMessage="Animate Talking"
                    description="Step name for 'Animate Talking' step"
                    id="gui.howtos.animate-char.step_animatetalking"
                />
            ),
            image: 'animateCharTalk'
        }, {
            title: (
                <FormattedMessage
                    defaultMessage="Move Using Arrow Keys"
                    description="Step name for 'Move Using Arrow Keys' step"
                    id="gui.howtos.animate-char.step_arrowkeys"
                />
            ),
            image: 'animateCharMove'
        }, {
            title: (
                <FormattedMessage
                    defaultMessage="Jump"
                    description="Step name for 'Jump' step"
                    id="gui.howtos.animate-char.step_jump"
                />
            ),
            image: 'animateCharJump'
        }, {
            title: (
                <FormattedMessage
                    defaultMessage="Change Color"
                    description="Step name for 'Change Color' step"
                    id="gui.howtos.animate-char.step_changecolor"
                />
            ),
            image: 'animateCharChangeColor'
        }, {
            deckIds: [
                'code-cartoon',
                'Tell-A-Story'
            ]
        }*/
