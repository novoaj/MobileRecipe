import React, { useRef } from 'react';
import {View, Image, Text, StyleSheet, Animated} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

type UserRecipeProps = {
    thumbnail: string;
    recipeId: string;
    label: string;
    deleteRecipe: (recipeId: string) => void;
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderColor: '#f2f2f2',
    },
    img: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    text: {
        textAlign: 'center',
        fontSize: 14,
    },
    rightAction: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    actionText: {
        color: 'white',
        alignSelf: 'flex-end',
    }
})

const UserRecipe: React.FC<UserRecipeProps> = ({ thumbnail, recipeId, label, deleteRecipe }) => {
    const swipeableRef = useRef<Swipeable>(null);
    const handleDelete = () => {
        // console.log(`Deleting recipe with id ${recipeId}`);
        deleteRecipe(recipeId)
        if (swipeableRef.current) {
          swipeableRef.current.close();
      }
        // need to propagate this up to the parent component
    }
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
          inputRange: [0, 50, 100, 101],
          outputRange: [-20, 0, 0, 1],
        });
        return (
          <RectButton style={styles.rightAction} onPress={handleDelete}>
            <Animated.Text
              style={[
                styles.actionText,
                {
                  transform: [{ translateX: trans }],
                },
              ]}>
              Delete
            </Animated.Text>
          </RectButton>
        );
      };
    return (
        <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
            <View style= {styles.container}>
                <Image style={styles.img} src={thumbnail} alt={label} />
                <Text style={styles.text}>{label}</Text>
                </View>
            </Swipeable>
        
    );
};

export default UserRecipe;