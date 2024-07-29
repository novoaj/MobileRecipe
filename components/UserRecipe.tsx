import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';

type UserRecipeProps = {
    thumbnail: string;
    recipeId: string;
    label: string;
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
    }
})

const UserRecipe: React.FC<UserRecipeProps> = ({ thumbnail, recipeId, label }) => {
    return (
        <View style= {styles.container}>
            <Image style={styles.img} src={thumbnail} alt={label} />
            <Text style={styles.text}>{label}</Text>
        </View>
    );
};

export default UserRecipe;