import React, { useRef } from 'react';
import {View, Image, Text, StyleSheet, Animated, Pressable} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import {faArrowAltCircleRight} from '@fortawesome/free-regular-svg-icons/faArrowAltCircleRight'
import {faCircleArrowRight} from '@fortawesome/free-solid-svg-icons/faCircleArrowRight'
import {COLORS} from '../constants/Colors';

type UserRecipeProps = {
    thumbnail: string;
    recipeId: string;
    label: string;
    deleteRecipe: (recipeId: string) => void;
    seeMore: (recipeId: string, recipeName : string) => void;
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.lightgray,
    },
    img: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    text: {
        textAlign: 'center',
        fontSize: 14,
        width: "70%",
    },
    rightAction: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        borderRadius: 12,
    },
    icon: {
        color: 'white',
        alignSelf: 'flex-end',
        paddingRight: 50,
    },
    arrow: {
      alignSelf: 'flex-end',
      paddingRight: 50,
      height: 50,
      margin: "auto",
      color: "#007AFF",

    }
})

const UserRecipe: React.FC<UserRecipeProps> = ({ thumbnail, recipeId, label, deleteRecipe, seeMore }) => {
    const swipeableRef = useRef<Swipeable>(null);
    const handleDelete = () => {
        deleteRecipe(recipeId) // propogate up to parent component
        if (swipeableRef.current) {
          swipeableRef.current.close(); // close this swipeable
      }
    }
    const handleSeeMore = () => {
      seeMore(recipeId, label) // propogate up to parent component  
     }
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
          inputRange: [0, 50, 100, 101],
          outputRange: [-20, 0, 0, 1],
        });
        return (
          <RectButton style={styles.rightAction} onPress={handleDelete}>
            <FontAwesomeIcon style={styles.icon} icon={faTrash} />
          </RectButton>
        );
      };
    return (
        <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
            <View style= {styles.container}>
                <Image style={styles.img} src={thumbnail} alt={label} />
                <Text style={styles.text}>{label}</Text>
                <Pressable onPress={handleSeeMore}>
                    <FontAwesomeIcon style={styles.arrow} icon={faCircleArrowRight} />
                </Pressable>  
               
            </View>
        </Swipeable>
    );
};

export default UserRecipe;